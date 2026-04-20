require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// PG Reviews Data
const pgReviewsData = [
  { rating: 5, comment: "Excellent PG! The maintenance is top-notch and the food is great." },
  { rating: 4, comment: "Very comfortable stay. The roommate matching worked well for me." },
  { rating: 5, comment: "Best value for money in this area. Clean rooms and helpful owner." },
  { rating: 3, comment: "Decent place, but the internet speed could be better sometimes." },
  { rating: 4, comment: "I've been staying here for 6 months. Safe and secure environment." },
  { rating: 5, comment: "Highly recommend for working professionals. Very quiet and well-managed." },
  { rating: 4, comment: "Good connectivity to the metro. Room is spacious." },
  { rating: 2, comment: "Food is okay, but cleaning service is sometimes missed." },
  { rating: 5, comment: "Luxury stay at an affordable price. Premium amenities." },
  { rating: 4, comment: "The management is very responsive to complaints." }
];

// Complaint History Data
const complaintHistoryData = [
  {
    complaint_id: 1,
    status: 'Pending',
    notes: 'Initial complaint received',
    changed_by: 'System',
    changed_at: new Date().toISOString()
  },
  {
    complaint_id: 1,
    status: 'In Progress',
    notes: 'Worker assigned: Ramesh Kumar',
    changed_by: 'Owner',
    changed_at: new Date(Date.now() + 3600000).toISOString()
  },
  {
    complaint_id: 2,
    status: 'In Progress',
    notes: 'Plumber on the way',
    changed_by: 'Owner',
    changed_at: new Date().toISOString()
  },
  {
    complaint_id: 3,
    status: 'Completed',
    notes: 'Cleaning completed successfully',
    changed_by: 'Worker',
    changed_at: new Date().toISOString()
  },
  {
    complaint_id: 4,
    status: 'Approved',
    notes: 'Kitchen staff notified for improvement',
    changed_by: 'Owner',
    changed_at: new Date().toISOString()
  },
  {
    complaint_id: 5,
    status: 'Pending',
    notes: 'Waiting for technician availability',
    changed_by: 'System',
    changed_at: new Date().toISOString()
  }
];

// Workers Assignment Data
const workersAssignmentData = [
  {
    complaint_id: 1,
    worker_id: 1,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Owner',
    status: 'Assigned'
  },
  {
    complaint_id: 2,
    worker_id: 6,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Owner',
    status: 'In Progress'
  },
  {
    complaint_id: 3,
    worker_id: 16,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Owner',
    status: 'Completed'
  },
  {
    complaint_id: 4,
    worker_id: 31,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Owner',
    status: 'Completed'
  },
  {
    complaint_id: 5,
    worker_id: 2,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Owner',
    status: 'Assigned'
  }
];

async function seedAllTables() {
  console.log('--- Starting Data Seeding for All Three Tables ---\n');

  // 1. Seed PG Reviews
  console.log('1. Seeding PG Reviews...');
  try {
    const { data: pgs } = await supabase.from('pg').select('pg_id');
    const { data: tenants } = await supabase.from('tenants').select('tenant_id');
    
    if (!pgs || pgs.length === 0 || !tenants || tenants.length === 0) {
      console.log('   No PGs or tenants found. Skipping pg_reviews.');
    } else {
      let totalReviews = 0;
      for (const pg of pgs) {
        const numReviews = Math.floor(Math.random() * 3) + 2;
        const records = [];
        
        for (let i = 0; i < numReviews; i++) {
          const review = pgReviewsData[Math.floor(Math.random() * pgReviewsData.length)];
          const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
          
          records.push({
            pg_id: pg.pg_id,
            tenant_id: randomTenant.tenant_id,
            rating: review.rating,
            review_text: review.comment,
            created_at: new Date().toISOString()
          });
        }

        const { error } = await supabase.from('pg_reviews').insert(records);
        if (!error) {
          totalReviews += records.length;
        }
      }
      console.log(`   ✓ Added ${totalReviews} reviews to pg_reviews`);
    }
  } catch (error) {
    console.log(`   ✗ Error seeding pg_reviews: ${error.message}`);
  }

  // 2. Seed Complaint History
  console.log('\n2. Seeding Complaint History...');
  try {
    const { error } = await supabase.from('complaint_history').insert(complaintHistoryData);
    if (error) {
      console.log(`   ✗ Error seeding complaint_history: ${error.message}`);
    } else {
      console.log(`   ✓ Added ${complaintHistoryData.length} records to complaint_history`);
    }
  } catch (error) {
    console.log(`   ✗ Error seeding complaint_history: ${error.message}`);
  }

  // 3. Seed Workers Assignment
  console.log('\n3. Seeding Workers Assignment...');
  try {
    const { error } = await supabase.from('workers_assignment').insert(workersAssignmentData);
    if (error) {
      console.log(`   ✗ Error seeding workers_assignment: ${error.message}`);
    } else {
      console.log(`   ✓ Added ${workersAssignmentData.length} records to workers_assignment`);
    }
  } catch (error) {
    console.log(`   ✗ Error seeding workers_assignment: ${error.message}`);
  }

  console.log('\n--- Seeding Complete ---');
}

seedAllTables();
