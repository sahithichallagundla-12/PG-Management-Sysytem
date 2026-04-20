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

async function checkData() {
  console.log('--- Checking Database Consistency ---');
  
  const { data: pgs } = await supabase.from('pgs').select('*');
  console.log(`PGs: ${pgs?.length || 0}`);
  
  const { data: users } = await supabase.from('users').select('*');
  console.log(`Users: ${users?.length || 0}`);
  
  const { data: tenants } = await supabase.from('tenants').select('*');
  console.log(`Tenants: ${tenants?.length || 0}`);

  if (tenants && tenants.length > 0) {
    console.log('Sample Tenant:', tenants[0]);
    const { data: user } = await supabase.from('users').select('*').eq('user_id', tenants[0].user_id).single();
    console.log('Linked User:', user ? user.email : 'NOT FOUND');
  }
}

checkData();
