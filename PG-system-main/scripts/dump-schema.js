require('dotenv').config({ path: '.env.local' });

async function checkDatabaseSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase credentials in .env.local file.");
    process.exit(1);
  }

  const tablesToCheck = [
    'users', 'profiles', 'pg', 'pgs', 'rooms', 'tenants', 'complaints', 
    'service_workers', 'worker_assignments', 'payments', 
    'food_menu', 'food_ratings', 'pg_reviews', 'notifications'
  ];

  console.log("=== CHECKING TABLE SCHEMAS ===");
  
  for (const table of tablesToCheck) {
    try {
      // By requesting text/csv, PostgREST returns the CSV headers row even if table is empty
      const response = await fetch(`${url}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Accept': 'text/csv'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Table doesn't exist or not exposed
          console.log(`\nTable [${table}] -> NOT FOUND (or not exposed via API)`);
        } else {
          console.log(`\nTable [${table}] -> Error: ${response.status} ${response.statusText}`);
        }
        continue;
      }
      
      const csvData = await response.text();
      const firstLine = csvData.split('\n')[0].trim();
      
      if (firstLine) {
        const columns = firstLine.split(',');
        console.log(`\nTable [${table}] columns:`);
        columns.forEach(col => console.log(`  - ${col.replace(/"/g, '')}`));
      } else {
         console.log(`\nTable [${table}] -> Exists, but couldn't parse columns.`);
      }

    } catch (err) {
      console.error(`Error connecting to table ${table}:`, err.message);
    }
  }
}

checkDatabaseSchema();
