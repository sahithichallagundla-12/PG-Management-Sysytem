require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function tryMinimalInsert() {
  console.log('--- Trying Minimal Inserts ---\n');

  // Try complaint_history with different column combinations
  console.log('1. Testing complaint_history columns...');
  
  const complaintHistoryVariations = [
    { complaint_id: 1, old_status: 'Pending', new_status: 'In Progress', changed_at: new Date().toISOString() },
    { complaint_id: 1, status: 'In Progress', updated_at: new Date().toISOString() },
    { complaint_id: 1, status: 'In Progress', created_at: new Date().toISOString() },
    { complaint_id: 1, status: 'In Progress', timestamp: new Date().toISOString() },
    { complaint_id: 1, status: 'In Progress' },
  ];

  for (let i = 0; i < complaintHistoryVariations.length; i++) {
    const variation = complaintHistoryVariations[i];
    console.log(`   Trying variation ${i + 1}: ${Object.keys(variation).join(', ')}`);
    
    const { error } = await supabase.from('complaint_history').insert([variation]);
    if (!error) {
      console.log(`   ✓ SUCCESS with columns: ${Object.keys(variation).join(', ')}`);
      break;
    } else {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }

  // Try worker_assignments with different column combinations
  console.log('\n2. Testing worker_assignments columns...');
  
  const workerAssignmentVariations = [
    { complaint_id: 1, worker_id: 1, assigned_at: new Date().toISOString() },
    { complaint_id: 1, worker_id: 1, created_at: new Date().toISOString() },
    { complaint_id: 1, worker_id: 1, timestamp: new Date().toISOString() },
    { complaint_id: 1, worker_id: 1 },
    { complaint_id: 1, service_worker_id: 1, assigned_at: new Date().toISOString() },
  ];

  for (let i = 0; i < workerAssignmentVariations.length; i++) {
    const variation = workerAssignmentVariations[i];
    console.log(`   Trying variation ${i + 1}: ${Object.keys(variation).join(', ')}`);
    
    const { error } = await supabase.from('worker_assignments').insert([variation]);
    if (!error) {
      console.log(`   ✓ SUCCESS with columns: ${Object.keys(variation).join(', ')}`);
      break;
    } else {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }
}

tryMinimalInsert();
