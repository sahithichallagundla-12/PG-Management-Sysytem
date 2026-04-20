require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function discoverStructure() {
  console.log('--- Discovering Table Structures ---\n');

  const tables = ['complaint_history', 'worker_assignments'];

  for (const tableName of tables) {
    console.log(`\nTable: ${tableName}`);
    
    // Try to get the table structure using Supabase's table info
    try {
      // Method 1: Try to select with limit 1 to see if we can get column info
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`   ✓ Table accessible`);
        if (data && data.length > 0) {
          console.log(`   Columns found: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`   Table is empty`);
        }
      } else {
        console.log(`   Error: ${error.message}`);
        
        // Method 2: Try to insert empty object to get column requirements
        console.log(`   Trying insert to discover columns...`);
        const { error: insertError } = await supabase
          .from(tableName)
          .insert([{}]);
        
        if (insertError) {
          console.log(`   Insert error: ${insertError.message}`);
        }
      }
    } catch (err) {
      console.log(`   Exception: ${err.message}`);
    }
  }

  // Also check if there's a way to get table info via RPC
  console.log('\n--- Trying RPC to get table info ---');
  try {
    const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'complaint_history' });
    if (error) {
      console.log('RPC not available:', error.message);
    } else {
      console.log('Schema data:', data);
    }
  } catch (err) {
    console.log('RPC exception:', err.message);
  }
}

discoverStructure();
