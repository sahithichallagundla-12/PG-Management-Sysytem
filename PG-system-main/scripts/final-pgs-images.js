require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const usersToUpsert = [
  { user_id: 1000003, name: 'Sunshine Owner', email: 'owner.sunshine@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999993', place: 'Hyderabad', is_active: true },
  { user_id: 1000004, name: 'Green Valley Owner', email: 'owner.greenvalley@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999994', place: 'Bangalore', is_active: true },
  { user_id: 1000005, name: 'City Comfort Owner', email: 'owner.citycomfort@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999995', place: 'Mumbai', is_active: true },
  { user_id: 1000006, name: 'Elite Living Owner', email: 'owner.eliteliving@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999996', place: 'Delhi', is_active: true },
  { user_id: 1000007, name: 'Metro Stay Owner', email: 'owner.metrostay@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999997', place: 'Pune', is_active: true },
  { user_id: 1000008, name: 'Capital Exec Owner', email: 'owner.capital@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999998', place: 'Gurgaon', is_active: true },
  { user_id: 1000009, name: 'Student Nest Owner', email: 'owner.studentnest@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9999999999', place: 'Hyderabad', is_active: true },
  { user_id: 5, name: 'Vikram Singh', email: 'vikram.singh@pgowner.com', password_hash: 'password123', role: 'owner', phone: '9876543214', place: 'Chennai', is_active: true }
];

const pgsToKeep = [
  { 
    pg_id: 1, owner_id: 1000003, pg_name: 'Sunshine Luxury PG', location: 'Madhapur, Hyderabad', address: 'Madhapur, Hyderabad',
    total_rooms: 20, available_rooms: 5, rent: 12000, rating: 5.0, amenities: ['WiFi', 'AC', 'Laundry', 'Gym'],
    room_type: 'Single', ac_type: 'AC', is_active: true, pg_category: 'Male', image: '/pg-images/sunshine-luxury-pg.jpg'
  },
  { 
    pg_id: 2, owner_id: 1000004, pg_name: 'Green Valley PG', location: 'Koramangala, Bangalore', address: 'Koramangala, Bangalore',
    total_rooms: 15, available_rooms: 3, rent: 10000, rating: 4.2, amenities: ['WiFi', 'AC', 'Food', 'Security'],
    room_type: 'Single', ac_type: 'AC', is_active: true, pg_category: 'Female', image: '/pg-images/green-valley-residency.jpg'
  },
  { 
    pg_id: 3, owner_id: 1000005, pg_name: 'City Comfort PG', location: 'Andheri, Mumbai', address: 'Andheri, Mumbai',
    total_rooms: 25, available_rooms: 8, rent: 12000, rating: 4.0, amenities: ['WiFi', 'Laundry', 'Food', 'CCTV'],
    room_type: 'Shared', ac_type: 'Both', is_active: true, pg_category: 'Male', image: '/pg-images/city-comfort-stay.jpg'
  },
  { 
    pg_id: 4, owner_id: 1000006, pg_name: 'Elite Living PG', location: 'Whitefield, Bangalore', address: 'Whitefield, Bangalore',
    total_rooms: 10, available_rooms: 2, rent: 14000, rating: 4.8, amenities: ['WiFi', 'Food', 'Laundry', 'Gym'],
    room_type: 'Single', ac_type: 'AC', is_active: true, pg_category: 'Male', image: '/pg-images/elite-living-studio.jpg'
  },
  { 
    pg_id: 5, owner_id: 1000007, pg_name: 'Metro Stay Home', location: 'Kukatpally, Hyderabad', address: 'Kukatpally, Hyderabad',
    total_rooms: 22, available_rooms: 4, rent: 8500, rating: 4.1, amenities: ['WiFi', 'Food', 'Security'],
    room_type: 'Shared', ac_type: 'Non-AC', is_active: true, pg_category: 'Female', image: '/pg-images/metro-stay-home.jpg'
  },
  { 
    pg_id: 6, owner_id: 1000008, pg_name: 'Capital Executive PG', location: 'Jubilee Hills, Hyderabad', address: 'Jubilee Hills, Hyderabad',
    total_rooms: 30, available_rooms: 10, rent: 14000, rating: 4.4, amenities: ['WiFi', 'AC', 'Food', 'Gym'],
    room_type: 'Single', ac_type: 'AC', is_active: true, pg_category: 'Male', image: '/pg-images/capital-executive-pg.jpg'
  },
  { 
    pg_id: 7, owner_id: 1000009, pg_name: 'Student Nest PG', location: 'Kothrud, Pune', address: 'Kothrud, Pune',
    total_rooms: 35, available_rooms: 15, rent: 6500, rating: 4.0, amenities: ['WiFi', 'Food', 'Study Room'],
    room_type: 'Shared', ac_type: 'Non-AC', is_active: true, pg_category: 'Female', image: '/pg-images/student-nest-pg.jpg'
  },
  { 
    pg_id: 8, owner_id: 5, pg_name: 'Heritage House PG', location: 'Alwarpet, Chennai', address: 'Alwarpet, Chennai',
    total_rooms: 18, available_rooms: 6, rent: 9500, rating: 4.3, amenities: ['WiFi', 'Parking', 'Food', 'Power Backup'],
    room_type: 'Both', ac_type: 'AC', is_active: true, pg_category: 'Male', image: '/pg-images/heritage-house-pg.jpg'
  }
];

async function seedData() {
  console.log('Inserting 8 owners into users table...');
  const { error: usersError } = await supabase
    .from('users')
    .upsert(usersToUpsert, { onConflict: 'user_id' });
    
  if (usersError) {
    console.error('Error inserting users:', usersError);
    return;
  }
  console.log('Successfully upserted 8 owners.');

  console.log('Inserting 8 PGs with photos into pgs table...');
  const { error: pgsError } = await supabase
    .from('pgs')
    .upsert(pgsToKeep, { onConflict: 'pg_id' });
    
  if (pgsError) {
    console.error('Error inserting PGs:', pgsError);
    return;
  }
  console.log('Successfully upserted 8 PG properties.');

  // Clean up all other PGs
  const validIds = pgsToKeep.map(pg => pg.pg_id);
  const { error: delError } = await supabase
    .from('pgs')
    .delete()
    .not('pg_id', 'in', `(${validIds.join(',')})`);
    
  if (delError) {
    console.error('Error deleting other PGs:', delError);
  } else {
    console.log('Successfully removed all PGs that do not have photos.');
  }
}

seedData();
