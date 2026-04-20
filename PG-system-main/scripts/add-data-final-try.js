require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addData() {
  console.log('--- Adding Data to Tables ---\n');

  const { data: complaints } = await supabase.from('complaints').select('complaint_id').limit(10);
  const { data: workers } = await supabase.from('service_workers').select('worker_id').limit(10);
  const { data: users } = await supabase.from('users').select('user_id').limit(10);
  const userId = users && users.length > 0 ? users[0].user_id : 5;

  // 1. complaint_history - try different action_type values
  console.log('1. Adding data to complaint_history...');
  if (complaints && complaints.length > 0) {
    const actionTypes = ['assigned', 'status_update', 'resolved', 'created', 'updated'];
    
    for (const actionType of actionTypes) {
      const history = [{
        complaint_id: complaints[0].complaint_id,
        old_status: 'Pending',
        new_status: 'In Progress',
        changed_by: userId,
        changed_at: new Date().toISOString(),
        action_type: actionType
      }];

      const { error } = await supabase.from('complaint_history').insert(history);
      if (!error) {
        console.log(`   ✓ Found valid action_type: "${actionType}"`);
        
        // Now add bulk data with this action_type
        const bulkHistory = [];
        for (const complaint of complaints.slice(0, 5)) {
          bulkHistory.push({
            complaint_id: complaint.complaint_id,
            old_status: 'Pending',
            new_status: 'In Progress',
            changed_by: userId,
            changed_at: new Date().toISOString(),
            action_type: actionType
          });
          bulkHistory.push({
            complaint_id: complaint.complaint_id,
            old_status: 'In Progress',
            new_status: 'Completed',
            changed_by: userId,
            changed_at: new Date(Date.now() + 3600000).toISOString(),
            action_type: actionType
          });
        }
        
        const { error: bulkError } = await supabase.from('complaint_history').insert(bulkHistory);
        if (!bulkError) {
          console.log(`   ✓ Added ${bulkHistory.length} history records`);
        } else {
          console.log(`   Bulk insert error: ${bulkError.message}`);
        }
        break;
      }
    }
  }

  // 2. worker_assignments - check if data already exists
  console.log('\n2. Adding data to worker_assignments...');
  const { data: existingAssignments } = await supabase.from('worker_assignments').select('*').limit(1);
  
  if (existingAssignments && existingAssignments.length > 0) {
    console.log(`   Table already has data. Skipping.`);
  } else if (complaints && complaints.length > 0 && workers && workers.length > 0) {
    const assignments = [];
    for (let i = 0; i < Math.min(5, complaints.length); i++) {
      const complaint = complaints[i];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      assignments.push({
        complaint_id: complaint.complaint_id,
        worker_id: worker.worker_id,
        assigned_by: userId,
        assigned_at: new Date().toISOString()
      });
    }

    const { error } = await supabase.from('worker_assignments').insert(assignments);
    if (!error) {
      console.log(`   ✓ Added ${assignments.length} assignments`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n--- Complete ---');
}

addData();
