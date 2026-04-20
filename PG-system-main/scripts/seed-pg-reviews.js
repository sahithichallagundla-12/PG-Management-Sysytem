require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const reviewsData = [
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

async function seedReviews() {
  console.log('Fetching PGs to add reviews...');
  const { data: pgs, error: pgError } = await supabase.from('pgs').select('pg_id');
  if (pgError) {
    console.error('Error fetching PGs:', pgError);
    return;
  }

  const { data: tenants, error: tenantError } = await supabase.from('tenants').select('tenant_id');
  if (tenantError) {
    console.error('Error fetching tenants:', tenantError);
    return;
  }

  console.log(`Adding random reviews for ${pgs.length} PGs...`);
  
  let totalAdded = 0;
  for (const pg of pgs) {
    // Add 3-5 reviews for each PG
    const numReviews = Math.floor(Math.random() * 3) + 3;
    const records = [];
    
    for (let i = 0; i < numReviews; i++) {
      const review = reviewsData[Math.floor(Math.random() * reviewsData.length)];
      const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
      
      records.push({
        pg_id: pg.pg_id,
        tenant_id: randomTenant.tenant_id, // Corrected to use valid tenant_id
        rating: review.rating,
        review_text: review.comment,
        created_at: new Date().toISOString()
      });
    }

    const { error: insertError } = await supabase.from('pg_reviews').insert(records);
    if (insertError) {
      console.error(`Error adding reviews for PG ${pg.pg_id}:`, insertError);
    } else {
      totalAdded += records.length;
    }
  }

  console.log(`Seeding complete. Added ${totalAdded} reviews.`);
}

seedReviews();
