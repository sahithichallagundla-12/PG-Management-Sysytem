require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function getEnums() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Port 6543 handles IPv4 with the connection pooler.
    client.port = 6543;
    await client.connect();
    
    // Get all enum types and their values
    const res = await client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'room_type' OR t.typname = 'payment_status' OR t.typname = 'complaint_status';
    `);
    
    console.log("ENUM VALUES:");
    console.table(res.rows);
    
  } catch (err) {
    console.error('Error connecting via pg:', err.message);
  } finally {
    await client.end();
  }
}

getEnums();
