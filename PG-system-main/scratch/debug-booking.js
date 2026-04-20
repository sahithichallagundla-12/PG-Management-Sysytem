require('dotenv').config({ path: '.env.local' });

async function debug() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Check if sindhu54@gmail.com exists in users table
  console.log('--- CHECK 1: Does sindhu54@gmail.com exist in users? ---');
  const res1 = await fetch(`${url}/rest/v1/users?email=eq.sindhu54@gmail.com`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const users1 = await res1.json();
  console.log('Result:', users1.length > 0 ? users1 : 'NOT FOUND');

  // 2. Check for similar emails (like gnyana54)
  console.log('\n--- CHECK 2: Any emails containing "sindhu" or "gnyana"? ---');
  const res2 = await fetch(`${url}/rest/v1/users?email=ilike.*sindhu*&select=user_id,email,name`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const users2 = await res2.json();
  console.log('sindhu matches:', users2);

  const res3 = await fetch(`${url}/rest/v1/users?email=ilike.*gnyana*&select=user_id,email,name`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const users3 = await res3.json();
  console.log('gnyana matches:', users3);

  // 3. Check tenants table columns
  console.log('\n--- CHECK 3: Tenants table structure (first row) ---');
  const res4 = await fetch(`${url}/rest/v1/tenants?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const tenants = await res4.json();
  if (tenants.length > 0) {
    console.log('Columns:', Object.keys(tenants[0]).join(', '));
    console.log('Sample:', tenants[0]);
  }

  // 4. Try booking with a brand new email via API to get the DETAILED error
  console.log('\n--- CHECK 4: Attempt booking with fresh email (via API) ---');
  const testEmail = `debug.test.${Date.now()}@example.com`;
  const bookRes = await fetch('http://localhost:3001/api/guest-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'test123',
      name: 'Debug User',
      phone: '9999999999',
      pg_id: 1,
      room_number: '105',
      room_type: 'single',
      sleep_preference: 'Early Sleeper',
      rent_amount: 10000
    })
  });
  const bookData = await bookRes.json();
  console.log(`Status: ${bookRes.status}`);
  console.log('Full response:', JSON.stringify(bookData, null, 2));
}

debug();
