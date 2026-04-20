
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPGs() {
  const { data, error, count } = await supabase
    .from('pgs')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching PGs:', error.message);
    return;
  }

  console.log(`Current PGs in database: ${count}`);
  console.log('Sample PG:', data[0]);
}

checkPGs();
