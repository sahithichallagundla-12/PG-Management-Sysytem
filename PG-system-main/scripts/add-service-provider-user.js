require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addServiceProviderUser() {
  console.log('--- Adding Service Provider User ---\n');
  
  const serviceProviderData = {
    name: 'Shyam Kumar',
    email: 'shyam.kumar@service.com',
    password_hash: '$2a$10$YourHashHere',
    role: 'service_provider',
    phone: '9900110002',
    place: 'Bangalore',
    is_active: true
  };

  const { data, error } = await supabase
    .from('users')
    .insert([serviceProviderData])
    .select();

  if (error) {
    console.log('Error adding service provider:', error.message);
  } else {
    console.log('✓ Successfully added service provider user:');
    console.log(`  ID: ${data[0].user_id}`);
    console.log(`  Name: ${data[0].name}`);
    console.log(`  Email: ${data[0].email}`);
    console.log(`  Role: ${data[0].role}`);
  }
}

addServiceProviderUser();
