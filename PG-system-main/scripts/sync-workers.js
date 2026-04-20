const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available for administrative inserts, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 35 workers with addresses
// Plumbers get Hyderabad addresses as requested
const staffToSync = [
  // Electricity (5) - Mix of Bangalore/Delhi
  { name: "Kiran Kumar", phone: "9876543201", email: "kiran.elec@email.com", category: "Electricity", status: "Available", address: "Sector 14, HSR Layout, Bangalore" },
  { name: "Suresh Rao", phone: "9876543202", email: "suresh.elec@email.com", category: "Electricity", status: "Busy", address: "Indiranagar, Bangalore" },
  { name: "Anil Kumar", phone: "9876543207", email: "anil.elec@email.com", category: "Electricity", status: "Available", address: "Vasant Vihar, Delhi" },
  { name: "Vijay Singh", phone: "9876543208", email: "vijay.elec@email.com", category: "Electricity", status: "On Leave", address: "Saket, Delhi" },
  { name: "Ramesh Singh", phone: "9876543203", email: "ramesh.elec@email.com", category: "Electricity", status: "Available", address: "Koramangala, Bangalore" },

  // Plumbing (5) - ALL HYDERABAD
  { name: "Raju Plumber", phone: "9876543204", email: "raju.plumb@email.com", category: "Plumbing", status: "Available", address: "Madhapur, Hyderabad" },
  { name: "Sandeep Gupta", phone: "9876543209", email: "sandeep.plumb@email.com", category: "Plumbing", status: "Busy", address: "Banjara Hills, Hyderabad" },
  { name: "Mohit Sharma", phone: "9876543212", email: "mohit.plumb@email.com", category: "Plumbing", status: "Available", address: "Ameerpet, Hyderabad" },
  { name: "Vikas Verma", phone: "9876543213", email: "vikas.plumb@email.com", category: "Plumbing", status: "Available", address: "Hi-Tech City, Hyderabad" },
  { name: "Sunil Das", phone: "9876543214", email: "sunil.plumb@email.com", category: "Plumbing", status: "On Leave", address: "Kondapur, Hyderabad" },

  // AC Technician (5) - Mix of Mumbai/Pune
  { name: "Mahesh AC", phone: "9876543205", email: "mahesh.ac@email.com", category: "AC Technician", status: "Busy", address: "Andheri East, Mumbai" },
  { name: "Rahul AC", phone: "9876543215", email: "rahul.ac@email.com", category: "AC Technician", status: "Available", address: "Bandra, Mumbai" },
  { name: "Pankaj AC", phone: "9876543216", email: "pankaj.ac@email.com", category: "AC Technician", status: "Available", address: "Hinjewadi, Pune" },
  { name: "Imran Khan", phone: "9876543217", email: "imran.ac@email.com", category: "AC Technician", status: "Available", address: "Kothrud, Pune" },
  { name: "Deepak AC", phone: "9876543218", email: "deepak.ac@email.com", category: "AC Technician", status: "Available", address: "Viman Nagar, Pune" },

  // Carpenter (5) - Chennai/Bangalore
  { name: "Vikram Carpenter", phone: "9876543206", email: "vikram.carp@email.com", category: "Carpenter", status: "Available", address: "Velachery, Chennai" },
  { name: "Sohan Carpenter", phone: "9876543219", email: "sohan.carp@email.com", category: "Carpenter", status: "Available", address: "T Nagar, Chennai" },
  { name: "Bablu Carpenter", phone: "9876543220", email: "bablu.carp@email.com", category: "Carpenter", status: "Available", address: "Whitefield, Bangalore" },
  { name: "Sanjay Carpenter", phone: "9876543221", email: "sanjay.carp@email.com", category: "Carpenter", status: "Available", address: "Electronic City, Bangalore" },
  { name: "Amit Carpenter", phone: "9876543222", email: "amit.carp@email.com", category: "Carpenter", status: "Available", address: "Adyar, Chennai" },

  // Internet (5) - Various
  { name: "Arjun Reddy", phone: "9876543210", email: "arjun.net@email.com", category: "Internet", status: "Available", address: "Madhapur, Hyderabad" },
  { name: "Varun Internet", phone: "9876543223", email: "varun.net@email.com", category: "Internet", status: "Available", address: "Jayanagar, Bangalore" },
  { name: "Sandeep Net", phone: "9876543224", email: "sandeep.net@email.com", category: "Internet", status: "Available", address: "Gurgaon, Delhi" },
  { name: "Kunal Tech", phone: "9876543225", email: "kunal.net@email.com", category: "Internet", status: "Available", address: "Powai, Mumbai" },
  { name: "Rishi Tech", phone: "9876543226", email: "rishi.net@email.com", category: "Internet", status: "Available", address: "Kharadi, Pune" },

  // Cleaning / Other (5) - Various 
  { name: "Sunita Devi", phone: "9876543211", email: "sunita.clean@email.com", category: "Cleaning", status: "Available", address: "Begumpet, Hyderabad" },
  { name: "Geeta Bai", phone: "9876543227", email: "geeta.clean@email.com", category: "Cleaning", status: "Available", address: "BTM Layout, Bangalore" },
  { name: "Rajesh Cleaning", phone: "9876543228", email: "rajesh.clean@email.com", category: "Cleaning", status: "Available", address: "Dadar, Mumbai" },
  { name: "Rekha Rani", phone: "9876543229", email: "rekha.clean@email.com", category: "Cleaning", status: "Available", address: "Mylapore, Chennai" },
  { name: "Kamlesh Cleaning", phone: "9876543230", email: "kamlesh.clean@email.com", category: "Cleaning", status: "Available", address: "Noida, UP" },

  // Food (5) - Various
  { name: "Ramesh Cook", phone: "9876543231", email: "ramesh.food@email.com", category: "Food", status: "Available", address: "Kukatpally, Hyderabad" },
  { name: "Suresh Chef", phone: "9876543232", email: "suresh.food@email.com", category: "Food", status: "Available", address: "Marathahalli, Bangalore" },
  { name: "Anita Kitchen", phone: "9876543233", email: "anita.food@email.com", category: "Food", status: "Busy", address: "Navi Mumbai, Mumbai" },
  { name: "Bhavna Cook", phone: "9876543234", email: "bhavna.food@email.com", category: "Food", status: "Available", address: "Wakad, Pune" },
  { name: "Dinesh Chef", phone: "9876543235", email: "dinesh.food@email.com", category: "Food", status: "Available", address: "Anna Nagar, Chennai" }
];

async function syncWorkers() {
  console.log(`Starting sync for ${staffToSync.length} workers...`);

  let successCount = 0;
  let errorCount = 0;

  for (const worker of staffToSync) {
    try {
      // First try to find if worker exists by phone
      const { data: existingData, error: fetchError } = await supabase
        .from('service_workers')
        .select('worker_id')
        .eq('phone', worker.phone)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error(`Error checking worker ${worker.name}:`, fetchError.message);
        errorCount++;
        continue;
      }

      if (existingData) {
        // Update existing worker
        const { error: updateError } = await supabase
          .from('service_workers')
          .update({
            name: worker.name,
            email: worker.email,
            category: worker.category,
            status: worker.status,
            address: worker.address
          })
          .eq('worker_id', existingData.worker_id);

        if (updateError) {
          console.error(`Error updating worker ${worker.name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`Updated worker: ${worker.name} (${worker.phone})`);
          successCount++;
        }
      } else {
        // Insert new worker
        const { error: insertError } = await supabase
          .from('service_workers')
          .insert([worker]);

        if (insertError) {
          console.error(`Error inserting worker ${worker.name}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`Inserted new worker: ${worker.name} (${worker.phone})`);
          successCount++;
        }
      }
    } catch (err) {
      console.error(`Exception processing worker ${worker.name}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n--- Sync Complete ---');
  console.log(`Total workers processed: ${staffToSync.length}`);
  console.log(`Successfully synced: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

syncWorkers();
