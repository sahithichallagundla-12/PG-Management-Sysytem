require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function go() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);
    const map = {};
    for (const r of res.rows) {
      if (!map[r.table_name]) map[r.table_name] = [];
      map[r.table_name].push(r.column_name + ' (' + r.data_type + ')');
    }
    console.log(JSON.stringify(map, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

go();
