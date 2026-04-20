require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function addImageColumn() {
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
    console.log('Connected to database. Checking for image column...');
    
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='pgs' AND column_name='image';
    `);

    if (checkRes.rowCount === 0) {
      console.log('Column "image" not found. Adding it...');
      await client.query('ALTER TABLE pgs ADD COLUMN image TEXT;');
      console.log('Column "image" added successfully.');
    } else {
      console.log('Column "image" already exists.');
    }
  } catch (err) {
    console.error('Error modifying database:', err);
  } finally {
    await client.end();
  }
}

addImageColumn();
