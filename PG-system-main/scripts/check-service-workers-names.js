require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkWorkerNames() {
  console.log('--- Checking Service Workers Names ---\n');
  
  const { data, error } = await supabase
    .from('service_workers')
    .select('*');
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log(`Total workers: ${data.length}\n`);
    data.forEach(worker => {
      console.log(`ID: ${worker.worker_id}, Name: ${worker.name}, Category: ${worker.category}`);
    });
  }
}

checkWorkerNames();
