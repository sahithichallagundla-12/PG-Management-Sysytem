require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDetailedSchemas() {
  console.log('--- Checking Detailed Table Schemas ---\n');

  // Check pg_reviews schema
  console.log('1. pg_reviews table:');
  try {
    const { data, error } = await supabase
      .from('pg_reviews')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`   Sample:`, data[0]);
    } else {
      console.log(`   Table is empty`);
    }
  } catch (err) {
    console.log(`   Exception: ${err.message}`);
  }

  // Check complaint_history schema
  console.log('\n2. complaint_history table:');
  try {
    const { data, error } = await supabase
      .from('complaint_history')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`   Sample:`, data[0]);
    } else {
      console.log(`   Table is empty`);
    }
  } catch (err) {
    console.log(`   Exception: ${err.message}`);
  }

  // Check for workers_assignment or similar tables
  console.log('\n3. Looking for workers assignment table...');
  const possibleNames = ['workers_assignment', 'worker_assignments', 'complaint_workers', 'worker_complaints', 'assigned_workers'];
  
  for (const name of possibleNames) {
    try {
      const { data, error } = await supabase
        .from(name)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`   ✓ Found table: ${name}`);
        if (data && data.length > 0) {
          console.log(`     Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      // Table doesn't exist, continue
    }
  }

  // Check if pg table is named 'pgs'
  console.log('\n4. Checking for PG table (pg or pgs):');
  try {
    const { data, error } = await supabase
      .from('pgs')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log(`   ✓ Found table: pgs`);
      if (data && data.length > 0) {
        console.log(`     Columns: ${Object.keys(data[0]).join(', ')}`);
        console.log(`     Sample PG:`, data[0]);
      }
    }
  } catch (err) {
    // Try 'pg' table
    try {
      const { data, error } = await supabase
        .from('pg')
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`   ✓ Found table: pg`);
        if (data && data.length > 0) {
          console.log(`     Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err2) {
      console.log(`   Neither 'pg' nor 'pgs' table found`);
    }
  }
}

checkDetailedSchemas();
