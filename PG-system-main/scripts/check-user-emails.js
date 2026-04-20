require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUserEmails() {
  console.log('--- Checking User Emails ---\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('user_id, name, email, role');
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`Total users: ${users.length}\n`);
  
  users.forEach(user => {
    console.log(`ID: ${user.user_id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
  });
}

checkUserEmails();
