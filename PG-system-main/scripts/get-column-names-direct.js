require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function getColumnNames() {
  try {
    await client.connect();
    console.log('--- Getting Column Names from PostgreSQL ---\n');

    const tables = ['complaint_history', 'worker_assignments'];

    for (const tableName of tables) {
      console.log(`Table: ${tableName}`);
      
      const query = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const result = await client.query(query, [tableName]);
      
      if (result.rows.length > 0) {
        console.log('   Columns:');
        result.rows.forEach(row => {
          console.log(`     - ${row.column_name} (${row.data_type})`);
        });
      } else {
        console.log(`   No columns found for table '${tableName}'`);
      }
      console.log('');
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

getColumnNames();
