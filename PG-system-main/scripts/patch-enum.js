const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function patchEnum() {
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
    
    // Add missing enum values
    try {
      await client.query("ALTER TYPE worker_category ADD VALUE IF NOT EXISTS 'Food'");
      console.log("Added 'Food' to worker_category enum");
    } catch (e) {
      console.log("Food enum adding failed:", e.message);
    }

    try {
      await client.query("ALTER TYPE worker_category ADD VALUE IF NOT EXISTS 'Cleaning'");
      console.log("Added 'Cleaning' to worker_category enum");
    } catch (e) {
      console.log("Cleaning enum adding failed:", e.message);
    }

  } catch (error) {
    console.error("Database connection error:", error.message);
    console.log("Fallback: we can try updating the category values manually in sync script to match existing enums if fixing DB schema fails (e.g., using 'Other' instead of 'Food')");
  } finally {
    await client.end();
  }
}

patchEnum();
