require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking worker_assignments table schema...');
  
  try {
    const { data, error } = await supabase
      .from('worker_assignments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`Sample:`, data[0]);
    } else {
      console.log(`Table is empty`);
    }
  } catch (err) {
    console.log(`Exception: ${err.message}`);
  }
}

checkSchema();
