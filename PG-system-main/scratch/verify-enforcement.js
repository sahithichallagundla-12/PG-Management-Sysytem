async function verifyEnforcement() {
  const baseUrl = 'http://localhost:3001'; // Assuming port 3001
  const existingTenantEmail = 'rahul.verma@email.com'; // Existing tenant
  const existingUserOnlyEmail = 'vikram.singh@pgowner.com'; // Existing owner, no tenant record
  
  console.log('--- TEST 1: Guest Booking with existing tenant ---');
  try {
    const res = await fetch(`${baseUrl}/api/guest-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: existingTenantEmail, password: 'pass', name: 'Test', pg_id: 1, room_number: '101' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Error: ${data.error}`);
    if (data.error === "Email already exists") console.log('PASS'); else console.log('FAIL');
  } catch(e) { console.log('Error:', e.message); }

  console.log('\n--- TEST 2: Guest Booking with existing user account ---');
  try {
    const res = await fetch(`${baseUrl}/api/guest-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: existingUserOnlyEmail, password: 'pass', name: 'Test', pg_id: 1, room_number: '101' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Error: ${data.error}`);
    if (data.error === "Email already exists") console.log('PASS'); else console.log('FAIL');
  } catch(e) { console.log('Error:', e.message); }

  console.log('\n--- TEST 3: Authenticated Booking with existing tenant record ---');
  try {
    const res = await fetch(`${baseUrl}/api/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 28, pg_id: 8, room_number: '102' }) // User 28 (Ajay Sinha) is already a tenant
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Error: ${data.error}`);
    if (data.error === "Email already exists") console.log('PASS'); else console.log('FAIL');
  } catch(e) { console.log('Error:', e.message); }
}

verifyEnforcement();
