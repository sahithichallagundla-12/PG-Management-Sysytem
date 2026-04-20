require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addDataToTables() {
  console.log('--- Adding Data to Three Tables ---\n');

  // Fetch existing data
  const { data: pgs } = await supabase.from('pgs').select('pg_id').limit(10);
  const { data: tenants } = await supabase.from('tenants').select('tenant_id').limit(10);
  const { data: complaints } = await supabase.from('complaints').select('complaint_id').limit(10);
  const { data: workers } = await supabase.from('service_workers').select('worker_id').limit(10);

  console.log(`Found ${pgs?.length || 0} PGs, ${tenants?.length || 0} tenants, ${complaints?.length || 0} complaints, ${workers?.length || 0} workers\n`);

  // 1. Add data to pg_reviews
  console.log('1. Adding data to pg_reviews...');
  if (pgs && pgs.length > 0 && tenants && tenants.length > 0) {
    const reviews = [];
    for (let i = 0; i < 10; i++) {
      const pg = pgs[Math.floor(Math.random() * pgs.length)];
      const tenant = tenants[Math.floor(Math.random() * tenants.length)];
      const comments = [
        "Excellent PG! Very clean and well-maintained.",
        "Good amenities, friendly staff.",
        "Best value for money in this area.",
        "Comfortable stay, would recommend.",
        "Great location, nice rooms.",
        "Food quality is excellent.",
        "Safe and secure environment.",
        "Management is very responsive.",
        "Spacious rooms with good ventilation.",
        "Overall wonderful experience."
      ];
      
      reviews.push({
        pg_id: pg.pg_id,
        tenant_id: tenant.tenant_id,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        review_text: comments[Math.floor(Math.random() * comments.length)],
        created_at: new Date().toISOString()
      });
    }

    const { error: reviewError } = await supabase.from('pg_reviews').insert(reviews);
    if (reviewError) {
      console.log(`   Error: ${reviewError.message}`);
      // Try with different column names
      console.log('   Trying alternative column names...');
      const altReviews = reviews.map(r => ({
        pg_id: r.pg_id,
        tenant_id: r.tenant_id,
        rating: r.rating,
        comment: r.review_text,
        created_at: r.created_at
      }));
      const { error: altError } = await supabase.from('pg_reviews').insert(altReviews);
      if (altError) {
        console.log(`   Alternative also failed: ${altError.message}`);
      } else {
        console.log(`   ✓ Added ${reviews.length} reviews`);
      }
    } else {
      console.log(`   ✓ Added ${reviews.length} reviews`);
    }
  } else {
    console.log('   Skipped: No PGs or tenants available');
  }

  // 2. Add data to complaint_history
  console.log('\n2. Adding data to complaint_history...');
  if (complaints && complaints.length > 0) {
    const history = [];
    const statuses = ['Pending', 'In Progress', 'Completed', 'Approved', 'Rejected'];
    
    for (const complaint of complaints.slice(0, 5)) {
      history.push({
        complaint_id: complaint.complaint_id,
        status: 'Pending',
        changed_by: 'System',
        changed_at: new Date().toISOString(),
        notes: 'Complaint registered'
      });
      
      history.push({
        complaint_id: complaint.complaint_id,
        status: 'In Progress',
        changed_by: 'Owner',
        changed_at: new Date(Date.now() + 3600000).toISOString(),
        notes: 'Worker assigned'
      });
    }

    const { error: historyError } = await supabase.from('complaint_history').insert(history);
    if (historyError) {
      console.log(`   Error: ${historyError.message}`);
      // Try without notes column
      const altHistory = history.map(h => ({
        complaint_id: h.complaint_id,
        status: h.status,
        changed_by: h.changed_by,
        changed_at: h.changed_at
      }));
      const { error: altError } = await supabase.from('complaint_history').insert(altHistory);
      if (altError) {
        console.log(`   Alternative also failed: ${altError.message}`);
      } else {
        console.log(`   ✓ Added ${history.length} history records`);
      }
    } else {
      console.log(`   ✓ Added ${history.length} history records`);
    }
  } else {
    console.log('   Skipped: No complaints available');
  }

  // 3. Add data to worker_assignments
  console.log('\n3. Adding data to worker_assignments...');
  if (complaints && complaints.length > 0 && workers && workers.length > 0) {
    const assignments = [];
    
    for (let i = 0; i < 5; i++) {
      const complaint = complaints[Math.floor(Math.random() * complaints.length)];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      
      assignments.push({
        complaint_id: complaint.complaint_id,
        worker_id: worker.worker_id,
        assigned_at: new Date().toISOString(),
        assigned_by: 'Owner',
        status: 'Assigned'
      });
    }

    const { error: assignmentError } = await supabase.from('worker_assignments').insert(assignments);
    if (assignmentError) {
      console.log(`   Error: ${assignmentError.message}`);
      // Try with different column names
      const altAssignments = assignments.map(a => ({
        complaint_id: a.complaint_id,
        worker_id: a.worker_id,
        created_at: a.assigned_at,
        status: a.status
      }));
      const { error: altError } = await supabase.from('worker_assignments').insert(altAssignments);
      if (altError) {
        console.log(`   Alternative also failed: ${altError.message}`);
      } else {
        console.log(`   ✓ Added ${assignments.length} assignments`);
      }
    } else {
      console.log(`   ✓ Added ${assignments.length} assignments`);
    }
  } else {
    console.log('   Skipped: No complaints or workers available');
  }

  console.log('\n--- Data Addition Complete ---');
}

addDataToTables();
