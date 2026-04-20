require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getTableColumns() {
  console.log('--- Getting Table Columns ---\n');

  const tables = ['complaint_history', 'worker_assignments'];

  for (const tableName of tables) {
    console.log(`Table: ${tableName}`);
    try {
      // Try to get column information by querying information_schema
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: tableName });
      
      if (error) {
        console.log(`   RPC Error: ${error.message}`);
        
        // Fallback: Try to insert a minimal record to see error message with column info
        console.log('   Trying alternative approach...');
        const { error: insertError } = await supabase
          .from(tableName)
          .insert({});
        
        if (insertError) {
          console.log(`   Insert error (may contain column info): ${insertError.message}`);
        }
      } else {
        console.log(`   Columns:`, data);
      }
    } catch (err) {
      console.log(`   Exception: ${err.message}`);
    }

    // Also try to describe the table using a direct query
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (error) {
        console.log(`   Select error: ${error.message}`);
      } else {
        console.log(`   Table exists and is accessible`);
      }
    } catch (err) {
      console.log(`   Select exception: ${err.message}`);
    }
    
    console.log('');
  }
}

getTableColumns();
