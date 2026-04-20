require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addCorrectData() {
  console.log('--- Adding Data with Correct Column Structure ---\n');

  // Fetch existing data
  const { data: complaints } = await supabase.from('complaints').select('complaint_id').limit(10);
  const { data: workers } = await supabase.from('service_workers').select('worker_id').limit(10);
  const { data: users } = await supabase.from('users').select('user_id').limit(10);

  console.log(`Found ${complaints?.length || 0} complaints, ${workers?.length || 0} workers, ${users?.length || 0} users\n`);

  // Get a valid user ID for changed_by and assigned_by
  const userId = users && users.length > 0 ? users[0].user_id : 5;

  // 1. Add data to complaint_history
  console.log('1. Adding data to complaint_history...');
  if (complaints && complaints.length > 0) {
    const history = [];
    
    for (const complaint of complaints.slice(0, 5)) {
      history.push({
        complaint_id: complaint.complaint_id,
        old_status: 'Pending',
        new_status: 'In Progress',
        changed_by: userId,
        changed_at: new Date().toISOString(),
        action_type: 'status_change'
      });
      
      history.push({
        complaint_id: complaint.complaint_id,
        old_status: 'In Progress',
        new_status: 'Completed',
        changed_by: userId,
        changed_at: new Date(Date.now() + 3600000).toISOString(),
        action_type: 'status_change'
      });
    }

    const { error: historyError } = await supabase.from('complaint_history').insert(history);
    if (historyError) {
      console.log(`   Error: ${historyError.message}`);
    } else {
      console.log(`   ✓ Added ${history.length} history records`);
    }
  } else {
    console.log('   Skipped: No complaints available');
  }

  // 2. Add data to worker_assignments
  console.log('\n2. Adding data to worker_assignments...');
  if (complaints && complaints.length > 0 && workers && workers.length > 0) {
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

    const { error: assignmentError } = await supabase.from('worker_assignments').insert(assignments);
    if (assignmentError) {
      console.log(`   Error: ${assignmentError.message}`);
    } else {
      console.log(`   ✓ Added ${assignments.length} assignments`);
    }
  } else {
    console.log('   Skipped: No complaints or workers available');
  }

  console.log('\n--- Data Addition Complete ---');
}

addCorrectData();
