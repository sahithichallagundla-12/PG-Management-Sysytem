require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helpers
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
  console.log('--- STARTING COMPLEX SEED ---');

  // FETCH EXACT 8 PGs
  const { data: pgs, error: pgsErr } = await supabase.from('pgs').select('pg_id, pg_name, owner_id');
  if (pgsErr || !pgs || pgs.length !== 8) {
    console.error('Expected exactly 8 PGs in the DB. Halting.', pgsErr);
    return;
  }

  console.log(`Found 8 PGs. Generating Rooms...`);
  // 6 rooms per PG = 48 rooms
  // 6 PGs multi-sharing only, 2 PGs mixed (Single + multi)
  
  // Pick 2 random PGs to be "mixed"
  const mixedPgIds = new Set();
  while(mixedPgIds.size < 2) {
    mixedPgIds.add(randomItem(pgs).pg_id);
  }

  const generatedRooms = [];
  let roomIdCounter = 1;
  const dbRooms = [];

  for (const pg of pgs) {
    const isMixed = mixedPgIds.has(pg.pg_id);
    for (let r = 1; r <= 6; r++) {
      let beds, roomType;
      if (isMixed && r === 1) {
        beds = 1;
        roomType = 'Single';
      } else {
        beds = randomInt(2, 4);
        const map = { 1: 'Single', 2: 'Double', 3: 'Triple', 4: 'Four' };
        roomType = map[beds];
      }
      
      const room = {
        pg_id: pg.pg_id,
        room_number: `${r}0${r}`,
        beds: beds,
        rent: randomInt(50, 150) * 100, // 5k to 15k
        room_type: roomType
      };
      generatedRooms.push({ ...room, logical_id: roomIdCounter++ });
      dbRooms.push(room);
    }
  }

  // Clear existing rooms just in case
  await supabase.from('rooms').delete().neq('room_number', 'impossible_value');
  
  const { data: insertedRooms, error: roomErr } = await supabase.from('rooms').insert(dbRooms).select();
  if (roomErr) {
    console.error('Room insertion error:', roomErr);
    return;
  }
  console.log(`Inserted ${insertedRooms.length} rooms.`);

  console.log('Generating 35 Tenants...');
  const activeRooms = insertedRooms;

  // We need exactly 35 tenants assigned to rooms while keeping at least 1 vacant spot per room!
  // And roommates must share the same sleep preference.
  
  const tenantsToInsert = [];
  const usersToInsert = [];
  
  for (let i = 1; i <= 35; i++) {
    usersToInsert.push({
      name: `Tenant ${i}`,
      email: `tenant${i}_${Date.now()}@example.com`,
      password_hash: 'password123',
      role: 'tenant',
      phone: `9988776${i.toString().padStart(3, '0')}`,
      place: 'City',
      is_active: true
    });
  }

  const { data: insertedUsers, error: userErr } = await supabase.from('users').insert(usersToInsert).select();
  if (userErr) {
    console.error('User insertion error:', userErr);
    return;
  }
  console.log(`Inserted 35 users for tenants.`);

  // Assign tenants to rooms
  const roomAssignments = {}; // roomId -> array of tenants
  activeRooms.forEach(r => {
    roomAssignments[r.room_id] = {
      room: r,
      tenants: [],
      preference: randomItem(['Night Owl', 'Early Sleeper']) // strict room pref
    };
  });

  // Since we only have 35 tenants and 48 rooms (with 1+ beds each, avg 3 beds => ~144 capacity),
  // we can easily place them without filling any room to max! (Max capacity is beds - 1)
  
  let unassignedUsers = [...insertedUsers];
  
  // Fill randomly but safely
  while(unassignedUsers.length > 0) {
    const user = unassignedUsers.pop();
    
    // Find valid room (currently holding < room.beds - 1)
    const validRoomIds = Object.keys(roomAssignments).filter(id => {
      const data = roomAssignments[id];
      const maxTenantsAllowed = Math.max(0, data.room.beds - 1);
      return data.tenants.length < maxTenantsAllowed;
    });

    if (validRoomIds.length === 0) {
      console.error('CRITICAL: No valid rooms left to assign! (Need at least 1 vacant bed per room)');
      return;
    }

    const assignedRoomId = validRoomIds[Math.floor(Math.random() * validRoomIds.length)];
    const dbRoom = roomAssignments[assignedRoomId].room;
    
    roomAssignments[assignedRoomId].tenants.push(user.user_id);
    
    tenantsToInsert.push({
      user_id: user.user_id,
      pg_id: dbRoom.pg_id,
      room_number: dbRoom.room_number,
      payment_status: 'Unpaid', // placeholder, will update
      sleep_preference: roomAssignments[assignedRoomId].preference
    });
  }

  const { data: insertedTenants, error: tenantErr } = await supabase.from('tenants').insert(tenantsToInsert).select();
  if (tenantErr) {
    console.error('Tenant insertion error:', tenantErr);
    return;
  }
  console.log(`Inserted 35 tenants with strict sleep preference and vacancy rules.`);

  // PAYMENTS: 35 exact representations of current status
  // 8 Unpaid (payment_status: 'Unpaid'), 5 Partially Paid (payment_status: 'Pending'), 22 Paid (payment_status: 'Paid')
  let statusList = [];
  for(let i=0; i<8; i++) statusList.push('Unpaid');
  for(let i=0; i<5; i++) statusList.push('Pending'); // Partially Paid mapped
  for(let i=0; i<22; i++) statusList.push('Paid');
  statusList = statusList.sort(() => 0.5 - Math.random());

  const paymentsToInsert = [];
  
  for (let i = 0; i < insertedTenants.length; i++) {
    const t = insertedTenants[i];
    const status = statusList[i];
    
    // Update tenant to reflect actual target status
    await supabase.from('tenants').update({ payment_status: status }).eq('tenant_id', t.tenant_id);

    const baseAmount = 8000;
    if (status === 'Unpaid') {
      paymentsToInsert.push({ tenant_id: t.tenant_id, pg_id: t.pg_id, amount: baseAmount, type: 'Room', status: 'Pending', month_year: '04-2026' });
    } else if (status === 'Pending') { // Represents Partially paid
      // We insert two payments. One completed partial, one pending partial
      paymentsToInsert.push({ tenant_id: t.tenant_id, pg_id: t.pg_id, amount: baseAmount/2, type: 'Room', status: 'Paid', month_year: '04-2026' });
      paymentsToInsert.push({ tenant_id: t.tenant_id, pg_id: t.pg_id, amount: baseAmount/2, type: 'Room', status: 'Pending', month_year: '04-2026' });
    } else { // Paid
      paymentsToInsert.push({ tenant_id: t.tenant_id, pg_id: t.pg_id, amount: baseAmount, type: 'Room', status: 'Paid', month_year: '04-2026' });
      paymentsToInsert.push({ tenant_id: t.tenant_id, pg_id: t.pg_id, amount: 3000, type: 'Food', status: 'Paid', month_year: '04-2026' }); // Some food paid
    }
  }

  const { error: paymentErr } = await supabase.from('payments').insert(paymentsToInsert);
  if (paymentErr) console.error('Payment insertion error:', paymentErr);
  else console.log(`Inserted payments mimicking exactly 8 Unpaid, 5 Partially Paid, 22 Paid.`);

  // SERVICE WORKERS (35 exactly across categories)
  console.log('Generating 35 Service Workers...');
  const workers = [];
  let wCounter = 1;
  const categories = [ {name: 'Electricity', count: 5}, {name: 'Plumbing', count: 5}, {name: 'Carpenter', count: 5}, {name: 'AC Technician', count: 5}, {name: 'Internet', count: 5}, {name: 'Cleaning', count: 10} ];
  for (const c of categories) {
    for (let j=0; j<c.count; j++) {
      workers.push({
        name: `${c.name} Expert ${j+1}`,
        phone: `9876540${wCounter.toString().padStart(2, '0')}`,
        category: c.name,
        status: randomItem(['Available', 'Busy']),
        rating: randomItem([4.0, 4.5, 5.0, 3.8])
      });
      wCounter++;
    }
  }
  const { data: insertedWorkers, error: workerErr } = await supabase.from('service_workers').insert(workers).select();
  if (workerErr) console.error('Worker insertion error:', workerErr);

  // COMPLAINTS: 20 active/resolved + 15 history rows
  console.log('Generating 35 Complaints...');
  const complaintsToInsert = [];
  for (let i = 0; i < 20; i++) {
    const t = randomItem(insertedTenants);
    complaintsToInsert.push({
      tenant_id: t.tenant_id,
      pg_id: t.pg_id,
      title: `Active Issue ${i+1}`,
      description: 'Need maintenance ASAP.',
      category: randomItem(['Electricity', 'Plumbing', 'Cleaning', 'Food']),
      status: randomItem(['Pending', 'In Progress', 'Approved'])
    });
  }
  for (let i = 0; i < 15; i++) {
    const t = randomItem(insertedTenants);
    complaintsToInsert.push({
      tenant_id: t.tenant_id,
      pg_id: t.pg_id,
      title: `Historical Issue ${i+1}`,
      description: 'Issue was resolved successfully.',
      category: randomItem(['Electricity', 'Plumbing', 'Cleaning', 'Food']),
      status: 'Completed' // Acts as history
    });
  }
  const { error: complaintErr } = await supabase.from('complaints').insert(complaintsToInsert);
  if (complaintErr) console.error('Complaint insertion error:', complaintErr);

  // NOTIFICATIONS: 5 unread alerts
  const notificationsToInsert = [];
  for (let i = 0; i < 5; i++) {
    notificationsToInsert.push({
      user_id: randomItem(insertedUsers).user_id, // tenant
      type: 'Alert',
      title: 'System Notification',
      message: 'Please check your portal for updates.',
      is_read: false
    });
  }
  const { error: notiErr } = await supabase.from('notifications').insert(notificationsToInsert);
  if (notiErr) console.log('Notification insertion error:', notiErr); // not fail on this if table doesnt perfectly match

  // FOOD MENU: 14 rows mapping
  const foodMenuToInsert = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Provide menus for 2 PGs
  for (let i = 0; i < 2; i++) {
    const pgForFood = pgs[i].pg_id;
    for (const d of days) {
      foodMenuToInsert.push({
        pg_id: pgForFood,
        day_of_week: d,
        meal_type: 'Breakfast',
        items: 'Poha & Chai'
      });
      foodMenuToInsert.push({
        pg_id: pgForFood,
        day_of_week: d,
        meal_type: 'Lunch',
        items: 'Dal, Roti, Rice'
      });
      foodMenuToInsert.push({
        pg_id: pgForFood,
        day_of_week: d,
        meal_type: 'Dinner',
        items: 'Paneer, Chapati'
      });
    }
  }
  const { data: insertedMenu, error: menuErr } = await supabase.from('food_menu').insert(foodMenuToInsert).select();
  if (menuErr) console.error('Food Menu insertion err:', menuErr);

  // FOOD RATINGS: 15 rows
  const foodRatingsToInsert = [];
  for (let i = 0; i < 15; i++) {
    foodRatingsToInsert.push({
      tenant_id: randomItem(insertedTenants).tenant_id,
      menu_id: randomItem(insertedMenu).menu_id,
      rating: randomInt(3, 5)
    });
  }
  const { error: foodRatingErr } = await supabase.from('food_ratings').insert(foodRatingsToInsert);
  if (foodRatingErr) console.error('Food Rating insertion err:', foodRatingErr);

  console.log('--- SEED COMPLETED SUCCESSFULLY ---');
}

seed();
