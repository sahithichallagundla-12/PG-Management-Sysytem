import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.obqctnmlzzpuvhcdtvpx:O3f%2A8mXvK9pL1qC@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const tables = ['complaint_history', 'worker_assignments', 'pg_reviews', 'user_sessions'];
    
    for (const t of tables) {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `, [t]);
      
      console.log(`\n=== Table: ${t} ===`);
      res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
