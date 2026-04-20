require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clearData() {
  const tablesToClear = [
    { name: 'complaints', pk: 'complaint_id' },
    { name: 'payments', pk: 'payment_id' },
    { name: 'food_ratings', pk: 'rating_id' },
    { name: 'pg_reviews', pk: 'review_id' },
    { name: 'food_menu', pk: 'menu_id' },
    { name: 'tenants', pk: 'tenant_id' },
    { name: 'rooms', pk: 'room_id' },
    { name: 'service_workers', pk: 'worker_id' }
  ];

  for (const table of tablesToClear) {
    console.log(`Clearing ${table.name}...`);
    const { error } = await supabase.from(table.name).delete().not(table.pk, 'is', null);
    if (error) {
       console.log(`Error clearing ${table.name}:`, error.message);
    } else {
       console.log(`${table.name} cleared.`);
    }
  }

  console.log(`Clearing non-owner users...`);
  const { error: userError } = await supabase.from('users').delete().neq('role', 'owner');
  if (userError) {
    console.log(`Error clearing users:`, userError.message);
  } else {
    console.log(`Users (except PG owners) cleared.`);
  }

  console.log('Database cleanup complete. PGs and their Owners have been preserved.');
}

clearData();
