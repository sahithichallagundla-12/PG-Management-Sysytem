const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const complaintsToSeed = [
  {
    tenant_id: 23,
    pg_id: 8,
    room_id: 38,
    title: 'Light flickers in corridor',
    description: 'The main corridor light has been flickering for two days. Needs immediate inspection.',
    category: 'Electricity',
    priority: 'Medium',
    status: 'In Progress',
    source: 'Tenant',
    created_at: new Date().toISOString()
  },
  {
    tenant_id: 23,
    pg_id: 8,
    room_id: 38,
    title: 'Main Switch Tripping',
    description: 'Power keeps cutting out when multiple appliances are on.',
    category: 'Electricity',
    priority: 'High',
    status: 'Not Completed',
    source: 'Owner',
    created_at: new Date().toISOString()
  },
  {
    tenant_id: 23,
    pg_id: 8,
    room_id: 38,
    title: 'Short circuit in Kitchen',
    description: 'Sparks observed near the toaster outlet.',
    category: 'Electricity',
    priority: 'High',
    status: 'Approved',
    source: 'Tenant',
    created_at: new Date().toISOString()
  },
  {
    tenant_id: 24,
    pg_id: 8,
    room_id: 39,
    title: 'Water pressure very low in Shower',
    description: 'Shower head barely has any water flow since morning.',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'In Progress',
    source: 'Tenant',
    created_at: new Date().toISOString()
  },
  {
    tenant_id: 24,
    pg_id: 8,
    room_id: 39,
    title: 'AC not cooling properly',
    description: 'The AC unit turns on but the air is not cold.',
    category: 'AC Technician',
    priority: 'Medium',
    status: 'In Progress',
    source: 'Tenant',
    created_at: new Date().toISOString()
  }
];

async function seedData() {
  console.log('--- Starting Database Seeding ---');
  
  const { data, error } = await supabase
    .from('complaints')
    .insert(complaintsToSeed)
    .select();

  if (error) {
    console.error('Error seeding complaints:', error.message);
  } else {
    console.log(`Successfully added ${data.length} new complaints to Supabase!`);
    console.log('Seeded data:', data.map(c => ({ id: c.complaint_id, title: c.title, category: c.category })));
  }
}

seedData();
