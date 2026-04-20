const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserType() {
  const { data: users } = await supabase.from('users').select('*').limit(1);
  if (users && users.length > 0) {
    console.log('Sample User ID:', users[0].user_id);
    console.log('Sample User ID Type:', typeof users[0].user_id);
  }
  
  const { data: tenants } = await supabase.from('tenants').select('*').limit(1);
  if (tenants && tenants.length > 0) {
    console.log('Sample Tenant User ID:', tenants[0].user_id);
    console.log('Sample Tenant User ID Type:', typeof tenants[0].user_id);
  }
}

checkUserType();
