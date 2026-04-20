require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchemas() {
  console.log('--- Checking Table Schemas ---\n');

  const tables = ['pg_reviews', 'complaint_history', 'workers_assignment'];

  for (const table of tables) {
    console.log(`Checking table: ${table}`);
    try {
      // Try to select a single row to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`   ✓ Table exists`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   Sample data:`, data[0]);
        } else {
          console.log(`   Table is empty`);
        }
        console.log('');
      }
    } catch (err) {
      console.log(`   Exception: ${err.message}\n`);
    }
  }

  // Also check existing related tables
  console.log('\n--- Checking Related Tables ---\n');
  const relatedTables = ['pg', 'tenants', 'complaints', 'service_workers'];
  
  for (const table of relatedTables) {
    console.log(`Checking table: ${table}`);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`   ✓ Table exists with ${data.length} rows`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
        console.log('');
      }
    } catch (err) {
      console.log(`   Exception: ${err.message}\n`);
    }
  }
}

checkSchemas();
