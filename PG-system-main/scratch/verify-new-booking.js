async function verifyNewUserBooking() {
  const baseUrl = 'http://localhost:3001'; // Assuming port 3001
  const newEmail = `new.tenant.${Date.now()}@example.com`;
  
  console.log(`--- TEST 4: Guest Booking with NEW email (${newEmail}) ---`);
  try {
    const res = await fetch(`${baseUrl}/api/guest-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: newEmail, 
        password: 'password123', 
        name: 'Brand New User', 
        phone: '1234512345',
        pg_id: 1, 
        room_number: '103',
        room_type: 'single',
        sleep_preference: 'early',
        rent_amount: 10000
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.ok && data.success) {
      console.log('PASS: Successfully booked and registered new user');
      console.log('User ID:', data.user.user_id);
      console.log('Tenant ID:', data.tenant.tenant_id);
    } else {
      console.log('FAIL: Expected success but got error:', data.error);
    }
  } catch(e) { console.log('Error:', e.message); }
}

verifyNewUserBooking();
