const fs = require('fs');

let content = fs.readFileSync('lib/data-store.ts', 'utf8');

// update interface
content = content.replace(/room_type\?:\s*"Single"\s*\|\s*"Shared"/, 'room_type?: "Single" | "Shared" | "Both"');
content = content.replace(/ac\?:\s*boolean/, 'ac_type?: "AC" | "Non-AC" | "Both"');

// update pg 1 (Both)
content = content.replace(/pg_name: "Sunshine PG",\s*location: "Madhapur, Hyderabad",\s*total_rooms: 20,\s*available_rooms: 5,\s*rent: 8000,\s*rating: 4.5,\s*amenities: \["WiFi", "Laundry", "Parking", "Gym"\],\s*room_type: "Shared",\s*ac: true,/g, 
`pg_name: "Sunshine PG",
    location: "Madhapur, Hyderabad",
    total_rooms: 20,
    available_rooms: 5,
    rent: 8000,
    rating: 4.5,
    amenities: ["WiFi", "Laundry", "Parking", "Gym"],
    room_type: "Both",
    ac_type: "Both",`);

// general replace for tracking the rest
content = content.replace(/ac: true,/g, 'ac_type: "AC",');
content = content.replace(/ac: false,/g, 'ac_type: "Non-AC",');

// make PG 3 'Both' for AC type
content = content.replace(/pg_name: "City Comfort PG",\s*location: "Andheri, Mumbai",\s*total_rooms: 25,\s*available_rooms: 8,\s*rent: 12000,\s*rating: 4.0,\s*amenities: \["WiFi", "Food", "Laundry", "CCTV"\],\s*room_type: "Shared",\s*ac_type: "Non-AC",/g,
`pg_name: "City Comfort PG",
    location: "Andheri, Mumbai",
    total_rooms: 25,
    available_rooms: 8,
    rent: 12000,
    rating: 4.0,
    amenities: ["WiFi", "Food", "Laundry", "CCTV"],
    room_type: "Shared",
    ac_type: "Both",`);

// PG 4 'Both' for Room type
content = content.replace(/pg_name: "Royal Stay PG",\s*location: "Hinjewadi, Pune",\s*total_rooms: 18,\s*available_rooms: 6,\s*rent: 7500,\s*rating: 4.3,\s*amenities: \["WiFi", "Parking", "Food", "Power Backup"\],\s*room_type: "Single",\s*ac_type: "AC",/g,
`pg_name: "Royal Stay PG",
    location: "Hinjewadi, Pune",
    total_rooms: 18,
    available_rooms: 6,
    rent: 7500,
    rating: 4.3,
    amenities: ["WiFi", "Parking", "Food", "Power Backup"],
    room_type: "Both",
    ac_type: "AC",`);

fs.writeFileSync('lib/data-store.ts', content);

let sqlContent = fs.readFileSync('scripts/002_seed_data.sql', 'utf8');

sqlContent = sqlContent.replace(/room_type, has_ac\) VALUES/g, 'room_type, ac_type) VALUES');
sqlContent = sqlContent.replace(/\('Sunshine PG', 'Madhapur, Hyderabad', 20, 5, 8000, 4.5, 1, ARRAY\['WiFi', 'AC', 'Laundry', 'Parking', 'Gym'\], 'Shared', true\)/g, 
"('Sunshine PG', 'Madhapur, Hyderabad', 20, 5, 8000, 4.5, 1, ARRAY['WiFi', 'AC', 'Laundry', 'Parking', 'Gym'], 'Both', 'Both')");

// replace all true with 'AC' and false with 'Non-AC' at the end of the tuples
sqlContent = sqlContent.replace(/, true\)/g, ", 'AC')");
sqlContent = sqlContent.replace(/, false\)/g, ", 'Non-AC')");

// fix specific ones
sqlContent = sqlContent.replace(/\('City Comfort PG', 'Andheri, Mumbai', 25, 8, 12000, 4.0, 3, ARRAY\['WiFi', 'Laundry', 'Food', 'CCTV'\], 'Shared', 'Non-AC'\)/g,
"('City Comfort PG', 'Andheri, Mumbai', 25, 8, 12000, 4.0, 3, ARRAY['WiFi', 'Laundry', 'Food', 'CCTV'], 'Shared', 'Both')");

sqlContent = sqlContent.replace(/\('Royal Stay PG', 'Hinjewadi, Pune', 18, 6, 7500, 4.3, 4, ARRAY\['WiFi', 'Parking', 'Food', 'Power Backup'\], 'Single', 'AC'\)/g,
"('Royal Stay PG', 'Hinjewadi, Pune', 18, 6, 7500, 4.3, 4, ARRAY['WiFi', 'Parking', 'Food', 'Power Backup'], 'Both', 'AC')");


fs.writeFileSync('scripts/002_seed_data.sql', sqlContent);
console.log('done!');
