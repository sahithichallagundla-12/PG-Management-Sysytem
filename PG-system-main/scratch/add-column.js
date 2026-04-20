
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function addColumn() {
  const client = new Client({
    connectionString: `postgresql://postgres.anlzihmeqpejhjwxgkmg:${process.env.DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected.');
    await client.query('ALTER TABLE pgs ADD COLUMN IF NOT EXISTS image TEXT');
    console.log('Successfully added image column.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

addColumn();
