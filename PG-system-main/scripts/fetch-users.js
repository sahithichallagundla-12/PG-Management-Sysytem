require('dotenv').config({ path: '.env.local' });

async function fetchUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(`${url}/rest/v1/users?select=*&order=user_id`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return;
  }

  const users = await response.json();
  
  console.log("=== USERS TABLE - Current Columns ===");
  if (users.length > 0) {
    console.log("Columns:", Object.keys(users[0]).join(", "));
  }
  
  console.log(`\n=== USERS TABLE - ${users.length} rows ===`);
  users.forEach(u => {
    console.log(`  [${u.user_id}] ${u.name} | ${u.email} | role: ${u.role} | phone: ${u.phone} | place: ${u.place}`);
  });
}

fetchUsers();
