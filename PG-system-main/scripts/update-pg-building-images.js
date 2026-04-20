require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const imageMap = {
  "heritage house pg": "/pg-images/heritage-house-pg.jpg",
  "sunshine luxury pg": "/pg-images/sunshine-luxury-pg.jpg",
  "city comfort pg": "/pg-images/city-comfort-stay.jpg",
  "green valley pg": "/pg-images/green-valley-residency.jpg",
  "metro living pg": "/pg-images/metro-stay-home.jpg",
  "elite living pg": "/pg-images/elite-living-studio.jpg",
  "student nest pg": "/pg-images/student-nest-pg.jpg",
  "capital homes pg": "/pg-images/capital-executive-pg.jpg",
  "metro stay home": "/pg-images/metro-stay-home.jpg",
  "elite living studio": "/pg-images/elite-living-studio.jpg",
  "city comfort stay": "/pg-images/city-comfort-stay.jpg",
  "green valley residency": "/pg-images/green-valley-residency.jpg"
};

async function updatePgImages() {
  console.log('Fetching PGs for image update...');
  const { data: pgs, error } = await supabase.from('pgs').select('pg_id, pg_name');
  
  if (error) {
    console.error('Error fetching PGs:', error);
    return;
  }

  let updateCount = 0;
  for (const pg of pgs) {
    const nameKey = pg.pg_name.toLowerCase();
    const imagePath = imageMap[nameKey];
    
    if (imagePath) {
      console.log(`Updating ${pg.pg_name} to use ${imagePath}`);
      const { error: updateError } = await supabase
        .from('pgs')
        .update({ image: imagePath })
        .eq('pg_id', pg.pg_id);

      if (updateError) {
        console.error(`Failed to update ${pg.pg_name}:`, updateError);
      } else {
        updateCount++;
      }
    }
  }

  console.log(`Done. Updated ${updateCount} PG images.`);
}

updatePgImages();
