
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function addCol() {
  const client = new Client({
    connectionString: `postgresql://postgres.anlzihmeqpejhjwxgkmg:${process.env.DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected. Running ALTER TABLE...');
    await client.query('ALTER TABLE pgs ADD COLUMN IF NOT EXISTS image TEXT');
    console.log('Column added successfully.');
    
    // Also let's do the updates here while we have the connection
    const updates = [
      { id: 8, img: '/rooms/heritage-house.png' },
      { id: 9, img: '/rooms/building-1.png' },
      { id: 10, img: '/rooms/building-2.png' },
      { id: 11, img: '/rooms/building-3.png' },
      { id: 12, img: '/rooms/building-4.png' },
      { id: 13, img: '/rooms/building-1.png' },
      { id: 14, img: '/rooms/building-2.png' },
      { id: 15, img: '/rooms/building-3.png' }
    ];

    for (const u of updates) {
      await client.query('UPDATE pgs SET image = $1 WHERE pg_id = $2', [u.img, u.id]);
      console.log(`Updated PG ${u.id}`);
    }

    console.log('All updates complete.');
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.end();
  }
}

addCol();
