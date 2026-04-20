require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function tryMoreActionTypes() {
  console.log('--- Testing More action_type Values ---\n');

  const { data: complaints } = await supabase.from('complaints').select('complaint_id').limit(1);
  const { data: users } = await supabase.from('users').select('user_id').limit(1);
  const userId = users && users.length > 0 ? users[0].user_id : 5;

  if (!complaints || complaints.length === 0) {
    console.log('No complaints found');
    return;
  }

  // Try many possible enum values
  const actionTypes = [
    'ASSIGNED', 'STATUS_CHANGE', 'RESOLVED', 'CREATED', 'UPDATED',
    'assigned', 'status_change', 'resolved', 'created', 'updated',
    'Status Change', 'Assigned', 'Resolved', 'Created', 'Updated',
    'assign', 'resolve', 'create', 'update',
    'ASSIGN', 'RESOLVE', 'CREATE', 'UPDATE',
    'worker_assigned', 'worker_assigned',
    'Worker Assigned', 'worker_assigned',
    'status_updated', 'Status Updated'
  ];

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
      console.log(`✓ SUCCESS with action_type: "${actionType}"`);
      
      // Delete this test record
      await supabase.from('complaint_history').delete().eq('complaint_id', complaints[0].complaint_id);
      console.log(`  (Test record deleted)`);
      
      // Now add bulk data with this action_type
      const { data: allComplaints } = await supabase.from('complaints').select('complaint_id').limit(10);
      if (allComplaints && allComplaints.length > 0) {
        const bulkHistory = [];
        for (const complaint of allComplaints.slice(0, 5)) {
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
          console.log(`✓ Added ${bulkHistory.length} history records to complaint_history`);
        } else {
          console.log(`Bulk insert error: ${bulkError.message}`);
        }
      }
      return;
    }
  }

  console.log('No valid action_type found');
}

tryMoreActionTypes();
