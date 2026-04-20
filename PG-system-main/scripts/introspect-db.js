require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function checkDatabaseSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use anon key for getting the OpenAPI spec
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase credentials in .env.local file.");
    process.exit(1);
  }

  try {
    const response = await fetch(`${url}/rest/v1/?apikey=${key}`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    
    const apiSpec = await response.json();
    const definitions = apiSpec.definitions || {};
    
    console.log("=== DATABASE TABLES AND COLUMNS ===");
    for (const [tableName, definition] of Object.entries(definitions)) {
      console.log(`\nTable: ${tableName}`);
      if (definition.properties) {
        for (const [colName, colProps] of Object.entries(definition.properties)) {
          console.log(`  - ${colName} (${colProps.type || 'unknown type'}${colProps.format ? ', format: ' + colProps.format : ''})`);
        }
      } else {
        console.log("  (No columns found or accessible)");
      }
    }

  } catch (err) {
    console.error("Error connecting to Supabase or fetching schema:", err.message);
  }
}

checkDatabaseSchema();
