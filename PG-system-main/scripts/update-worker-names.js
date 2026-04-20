require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Actual names for each category
const actualNames = {
  'Electricity': ['Kiran Kumar', 'Suresh Rao', 'Anil Kumar', 'Vijay Singh', 'Ramesh Singh'],
  'Plumbing': ['Raju Plumber', 'Sandeep Gupta', 'Mohit Sharma', 'Vikas Verma', 'Sunil Das'],
  'Carpenter': ['Vikram Carpenter', 'Sohan Carpenter', 'Bablu Carpenter', 'Sanjay Carpenter', 'Amit Carpenter'],
  'AC Technician': ['Mahesh AC', 'Rahul AC', 'Pankaj AC', 'Imran Khan', 'Deepak AC'],
  'Internet': ['Arjun Reddy', 'Varun Internet', 'Sandeep Net', 'Kunal Tech', 'Rishi Tech'],
  'Cleaning': ['Sunita Devi', 'Geeta Bai', 'Rajesh Cleaning', 'Rekha Rani', 'Kamlesh Cleaning', 'Meena Devi', 'Lakshmi Bai', 'Savita Cleaning', 'Anita Devi', 'Kavita Cleaning']
};

async function updateWorkerNames() {
  console.log('--- Updating Service Worker Names ---\n');
  
  const { data: workers, error } = await supabase
    .from('service_workers')
    .select('*');
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }

  let updatedCount = 0;

  for (const worker of workers) {
    const category = worker.category;
    const names = actualNames[category];
    
    if (names) {
      // Get the index from the current name (e.g., "Electricity Expert 3" -> index 2)
      const match = worker.name.match(/Expert (\d+)/);
      let index = 0;
      
      if (match) {
        index = parseInt(match[1]) - 1;
      }
      
      // Get the actual name (wrap around if index exceeds array length)
      const actualName = names[index % names.length];
      
      // Update the worker name
      const { error: updateError } = await supabase
        .from('service_workers')
        .update({ name: actualName })
        .eq('worker_id', worker.worker_id);
      
      if (!updateError) {
        console.log(`Updated ID ${worker.worker_id}: "${worker.name}" → "${actualName}"`);
        updatedCount++;
      } else {
        console.log(`Error updating ID ${worker.worker_id}: ${updateError.message}`);
      }
    }
  }

  console.log(`\n✓ Successfully updated ${updatedCount} worker names`);
}

updateWorkerNames();
