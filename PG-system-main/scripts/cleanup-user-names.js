require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanupUserNames() {
  console.log('Fetching users for name cleanup...');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('user_id, name, email, role');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Fetched ${users.length} users.`);
  
  const realisticNames = [
    'Vikram Pavan', 'Kiran Sharma', 'Rahul Reddy', 'Priya Iyer', 'Anjali Singh',
    'Arjun Nair', 'Siddharth Rao', 'Neha Gupta', 'Amit Patel', 'Sneha Kulkarni',
    'Rohan Deshmukh', 'Ishaan Verma', 'Zara Khan', 'Manish Joshi', 'Kavita Devi',
    'Suresh Kumar', 'Sunita Rao', 'Rajesh Gupta', 'Meena Sharma', 'Arvind Rao',
    'Lakshmi Iyer', 'Deepak Singh', 'Pankaj Kumar', 'Shweta Patel', 'Gaurav Jain'
  ];

  let updateCount = 0;

  for (const user of users) {
    // Check if name is too short or seems like a placeholder
    const trimmedName = user.name.trim();
    const isPlaceholder = trimmedName.length <= 3 || 
                          trimmedName.includes('.') || 
                          trimmedName.toLowerCase().includes('seed') ||
                          trimmedName.toLowerCase().includes('tenant');
    
    if (isPlaceholder) {
      const newName = realisticNames[updateCount % realisticNames.length];
      console.log(`Updating user ${user.user_id}: "${user.name}" -> "${newName}"`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: newName })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`Failed to update user ${user.user_id}:`, updateError);
      } else {
        updateCount++;
      }
    }
  }

  console.log(`Cleanup complete. Updated ${updateCount} users.`);
}

cleanupUserNames();
