require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function cleanup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log("=== STARTING DATABASE CLEANUP ===");

  // 1. Update passwords to match names
  console.log("\n1. Updating users: password_hash = name...");
  const { data: users, error: userError } = await supabase.from('users').select('user_id, name');
  if (userError) {
    console.error("Error fetching users:", userError.message);
  } else {
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .update({ password_hash: user.name })
        .eq('user_id', user.user_id);
      if (error) console.error(`  - Error updating user ${user.user_id}:`, error.message);
    }
    console.log(`  - Updated ${users.length} users.`);
  }

  // 2. Shorten Room Numbers (not IDs, as IDs were integers but numbers were SEED strings)
  console.log("\n2. Shortening room numbers...");
  const { data: rooms, error: roomError } = await supabase.from('rooms').select('room_id, room_number, pg_id');
  if (roomError) {
    console.error("Error fetching rooms:", roomError.message);
  } else {
    // We'll rename them to 101, 102, 201, 202 format per PG
    const pgRoomCount = {};
    for (const room of rooms) {
      if (!pgRoomCount[room.pg_id]) pgRoomCount[room.pg_id] = 100;
      pgRoomCount[room.pg_id]++;
      
      const newNumber = String(pgRoomCount[room.pg_id]);
      const oldNumber = room.room_number;

      if (oldNumber === newNumber) continue;

      console.log(`  - Mapping Room ${room.room_id}: "${oldNumber}" -> "${newNumber}"`);

      // Update room table
      const { error: roomUpdErr } = await supabase
        .from('rooms')
        .update({ room_number: newNumber })
        .eq('room_id', room.room_id);
      if (roomUpdErr) console.error(`    - Error updating room ${room.room_id}:`, roomUpdErr.message);

      // Update tenants table
      const { error: tenErr } = await supabase
        .from('tenants')
        .update({ room_number: newNumber })
        .eq('room_id', room.room_id);
      if (tenErr) console.error(`    - Error updating tenants for room ${room.room_id}:`, tenErr.message);
    }
    console.log("  - Room number shortening complete.");
  }

  console.log("\n=== CLEANUP FINISHED ===");
}

cleanup().catch(err => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});
