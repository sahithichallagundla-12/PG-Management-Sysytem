require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fillNulls() {
  console.log('Filling nulls...');

  // 1. PGs
  await supabase.from('pgs').update({
    description: 'A beautiful PG accommodation perfectly suited for long stays with modern amenities.',
    rules: ['No smoking', 'No pets', 'No guests after 10 PM', 'Maintain cleanliness']
  }).is('description', null);
  console.log('PGs updated.');

  // 2. Rooms
  await supabase.from('rooms').update({
    photos: ['/rooms/building-1.png'],
    description: 'A spacious and well-ventilated room with an attached balcony.'
  }).is('description', null);
  console.log('Rooms updated.');

  // FETCH ROOMS to get room_id mapping
  const { data: rooms } = await supabase.from('rooms').select('room_id, pg_id, room_number');

  // 3. Tenants
  const { data: tenants } = await supabase.from('tenants').select('tenant_id, pg_id, room_number').is('move_in_date', null);
  if (tenants && tenants.length > 0) {
    for (const t of tenants) {
      const room = rooms.find(r => r.pg_id === t.pg_id && r.room_number === t.room_number);
      await supabase.from('tenants').update({
        room_id: room ? room.room_id : null,
        move_in_date: '2024-01-01T00:00:00Z',
        move_out_date: '2024-12-31T00:00:00Z',
        rent_amount: 8000,
        security_deposit: 16000,
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '9900000000',
        id_proof_type: 'Aadhar',
        id_proof_number: '123456789012'
      }).eq('tenant_id', t.tenant_id);
    }
  }
  console.log('Tenants updated.');

  // 4. Payments
  await supabase.from('payments').update({
    payment_date: '2026-04-01T00:00:00Z',
    due_date: '2026-04-05T00:00:00Z',
    transaction_id: 'TXN123456789',
    payment_method: 'UPI',
    remarks: 'Auto-updated default transaction',
    paid_at: '2026-04-02T00:00:00Z'
  }).is('payment_date', null);
  console.log('Payments updated.');

  // 5. Complaints
  const { data: complaints } = await supabase.from('complaints').select('complaint_id, tenant_id').is('resolved_at', null);
  if (complaints && complaints.length > 0) {
    // We need tenant's room_id for complaints.room_id
    const { data: tMaps } = await supabase.from('tenants').select('tenant_id, room_id');
    for (const c of complaints) {
      const tInfo = tMaps.find(t => t.tenant_id === c.tenant_id);
      await supabase.from('complaints').update({
        room_id: tInfo ? tInfo.room_id : null,
        resolved_at: '2026-04-10T00:00:00Z'
      }).eq('complaint_id', c.complaint_id);
    }
  }
  console.log('Complaints updated.');

  // 6. Food Ratings
  await supabase.from('food_ratings').update({
    feedback: 'Excellent food quality and hygiene.'
  }).is('feedback', null);
  console.log('Food ratings updated.');

  // 7. Food Menu
  await supabase.from('food_menu').update({
    timing: 'Standard Meal Time',
    special_notes: 'Available for all residents'
  }).is('timing', null);
  console.log('Food menu updated.');

  // 8. Notifications
  await supabase.from('notifications').update({
    related_id: 1,
    related_type: 'System'
  }).is('related_id', null);
  console.log('Notifications updated.');

  console.log('All operations finished!');
}

fillNulls();
