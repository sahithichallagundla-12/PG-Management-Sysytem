require('dotenv').config({ path: '.env.local' });

async function deleteUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const emailsToDelete = [
    'gnyanasindhu54@gmail.com',
    'hasini@gmail.com'
  ];

  for (const email of emailsToDelete) {
    console.log(`Deleting user: ${email}...`);

    const response = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  ERROR deleting ${email}: ${response.status} - ${errText}`);
    } else {
      const deleted = await response.json();
      if (deleted.length > 0) {
        console.log(`  SUCCESS: Deleted user_id=${deleted[0].user_id} (${email})`);
      } else {
        console.log(`  NOT FOUND: No user with email ${email}`);
      }
    }
  }

  console.log('\nDone. Verifying remaining users...');
  
  // Verify
  const verifyRes = await fetch(`${url}/rest/v1/users?select=user_id,email,role&order=user_id`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const remaining = await verifyRes.json();
  const found = remaining.filter(u => emailsToDelete.includes(u.email));
  if (found.length === 0) {
    console.log('Confirmed: Both rows have been deleted successfully.');
  } else {
    console.log('WARNING: Some rows may not have been deleted:', found);
  }
}

deleteUsers();
