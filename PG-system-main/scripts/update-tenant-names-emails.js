require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Proper tenant names and emails from seed data
const tenantData = [
  { name: 'Rahul Verma', email: 'rahul.verma@email.com' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@email.com' },
  { name: 'Arjun Nair', email: 'arjun.nair@email.com' },
  { name: 'Kavitha Menon', email: 'kavitha.menon@email.com' },
  { name: 'Deepak Joshi', email: 'deepak.joshi@email.com' },
  { name: 'Ananya Das', email: 'ananya.das@email.com' },
  { name: 'Rohit Saxena', email: 'rohit.saxena@email.com' },
  { name: 'Meera Krishnan', email: 'meera.krishnan@email.com' },
  { name: 'Sanjay Gupta', email: 'sanjay.gupta@email.com' },
  { name: 'Pooja Agarwal', email: 'pooja.agarwal@email.com' },
  { name: 'Karthik Raman', email: 'karthik.raman@email.com' },
  { name: 'Divya Pillai', email: 'divya.pillai@email.com' },
  { name: 'Nikhil Bhatt', email: 'nikhil.bhatt@email.com' },
  { name: 'Swati Mishra', email: 'swati.mishra@email.com' },
  { name: 'Arun Prakash', email: 'arun.prakash@email.com' },
  { name: 'Priyanka Shah', email: 'priyanka.shah@email.com' },
  { name: 'Varun Malhotra', email: 'varun.malhotra@email.com' },
  { name: 'Lakshmi Rao', email: 'lakshmi.rao@email.com' },
  { name: 'Suresh Kumar', email: 'suresh.kumar@email.com' },
  { name: 'Anjali Chopra', email: 'anjali.chopra@email.com' },
  { name: 'Manish Tiwari', email: 'manish.tiwari@email.com' },
  { name: 'Rekha Nayak', email: 'rekha.nayak@email.com' },
  { name: 'Ajay Sinha', email: 'ajay.sinha@email.com' },
  { name: 'Neha Kapoor', email: 'neha.kapoor@email.com' },
  { name: 'Vijay Krishna', email: 'vijay.krishna@email.com' },
  { name: 'Ramesh Patel', email: 'ramesh.patel@email.com' },
  { name: 'Sunita Sharma', email: 'sunita.sharma@email.com' },
  { name: 'Vikas Joshi', email: 'vikas.joshi@email.com' },
  { name: 'Priya Singh', email: 'priya.singh@email.com' },
  { name: 'Amit Verma', email: 'amit.verma@email.com' },
  { name: 'Kavita Rao', email: 'kavita.rao@email.com' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com' },
  { name: 'Meena Devi', email: 'meena.devi@email.com' },
  { name: 'Sunil Reddy', email: 'sunil.reddy@email.com' },
  { name: 'Anita Desai', email: 'anita.desai@email.com' }
];

async function updateTenantNamesEmails() {
  console.log('--- Updating Tenant Names and Emails ---\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('user_id, name, email')
    .eq('role', 'tenant');
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`Found ${users.length} tenant users\n`);

  let updatedCount = 0;
  
  for (let i = 0; i < Math.min(users.length, tenantData.length); i++) {
    const user = users[i];
    const newData = tenantData[i];
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        name: newData.name,
        email: newData.email
      })
      .eq('user_id', user.user_id);
    
    if (!updateError) {
      console.log(`Updated ID ${user.user_id}: "${user.name}" → "${newData.name}"`);
      console.log(`  Email: "${user.email}" → "${newData.email}"`);
      updatedCount++;
    } else {
      console.log(`Error updating ID ${user.user_id}: ${updateError.message}`);
    }
  }

  console.log(`\n✓ Successfully updated ${updatedCount} tenant names and emails`);
}

updateTenantNamesEmails();
