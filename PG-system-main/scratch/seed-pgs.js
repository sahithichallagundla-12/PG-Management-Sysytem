
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedData() {
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
    console.log('Connected to database successfully.');

    // 1. Add image column if missing
    console.log('Checking for image column...');
    await client.query(`
      ALTER TABLE pgs ADD COLUMN IF NOT EXISTS image TEXT;
    `);
    console.log('Image column ensured.');

    // 2. Insert 7 PGs
    const newPGs = [
      {
        owner_id: 5,
        pg_name: 'Sunshine Luxury PG',
        location: 'Madhapur, Hyderabad',
        address: 'Hitech City Road, Madhapur',
        total_rooms: 40,
        available_rooms: 15,
        rent: 12000,
        rating: 4.8,
        amenities: ['WiFi', 'Gym', 'Laundry', 'Food', 'AC'],
        pg_category: 'Unisex',
        description: 'Premium luxury living in the heart of Hitech City with modern amenities.',
        rules: 'No parties, ID required, In-gate by 11 PM',
        ac_type: 'AC',
        room_type: 'Single'
      },
      {
        owner_id: 5,
        pg_name: 'Green Valley Residency',
        location: 'Koramangala, Bangalore',
        address: '7th Block, Koramangala',
        total_rooms: 25,
        available_rooms: 8,
        rent: 9500,
        rating: 4.2,
        amenities: ['WiFi', 'Food', 'Security', 'Parking'],
        pg_category: 'Female',
        description: 'Quiet and green environment perfect for working professionals.',
        rules: 'Safety first, No guests after 9 PM',
        ac_type: 'AC and Non-AC',
        room_type: 'Single and Shared'
      },
      {
        owner_id: 5,
        pg_name: 'City Comfort Stay',
        location: 'Andheri West, Mumbai',
        address: 'Link Road, Andheri',
        total_rooms: 30,
        available_rooms: 12,
        rent: 15000,
        rating: 4.5,
        amenities: ['WiFi', 'Food', 'Power Backup', 'CCTV'],
        pg_category: 'Male',
        description: 'Prime location close to metro stations and business hubs.',
        rules: 'Cleanliness maintained, Strictly no pets',
        ac_type: 'AC',
        room_type: 'Shared'
      },
      {
        owner_id: 5,
        pg_name: 'Elite Living Studio',
        location: 'Whitefield, Bangalore',
        address: 'Near ITPL, Whitefield',
        total_rooms: 18,
        available_rooms: 4,
        rent: 13500,
        rating: 4.7,
        amenities: ['WiFi', 'Gym', 'Swimming Pool', 'Food'],
        pg_category: 'Unisex',
        description: 'Boutique PG experience with semi-furnished apartments.',
        rules: 'Maintain decorum, Electricity shared',
        ac_type: 'AC',
        room_type: 'Single'
      },
      {
        owner_id: 5,
        pg_name: 'Metro Stay Home',
        location: 'Velachery, Chennai',
        address: 'Main Road, Velachery',
        total_rooms: 22,
        available_rooms: 7,
        rent: 8500,
        rating: 4.0,
        amenities: ['WiFi', 'Food', 'Laundry', 'Parking'],
        pg_category: 'Male',
        description: 'Affordable and reliable stay with good connectivity.',
        rules: 'Timely payments, Noise control',
        ac_type: 'Non-AC',
        room_type: 'Shared'
      },
      {
        owner_id: 5,
        pg_name: 'Capital Executive PG',
        location: 'Gurgaon Sector 44, Delhi',
        address: 'Sector 44, Near Metro',
        total_rooms: 35,
        available_rooms: 10,
        rent: 14000,
        rating: 4.4,
        amenities: ['WiFi', 'Food', 'Laundry', 'Security', 'Gym'],
        pg_category: 'Unisex',
        description: 'High-class executive PG with premium services.',
        rules: 'Professional conduct, Quiet hours',
        ac_type: 'AC',
        room_type: 'Single'
      },
      {
        owner_id: 5,
        pg_name: 'Student Nest PG',
        location: 'Kothrud, Pune',
        address: 'Near MIT, Kothrud',
        total_rooms: 50,
        available_rooms: 20,
        rent: 6500,
        rating: 3.9,
        amenities: ['WiFi', 'Food', 'Study Area', 'Laundry'],
        pg_category: 'Female',
        description: 'Safe and supportive environment for students.',
        rules: 'Study hours respected, Visitor logs',
        ac_type: 'Non-AC',
        room_type: 'Shared'
      }
    ];

    console.log('Inserting 7 new PGs...');
    for (const pg of newPGs) {
       await client.query(`
        INSERT INTO pgs (
          owner_id, pg_name, location, address, total_rooms, 
          available_rooms, rent, rating, amenities, pg_category, 
          description, rules, ac_type, room_type, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        pg.owner_id, pg.pg_name, pg.location, pg.address, pg.total_rooms,
        pg.available_rooms, pg.rent, pg.rating, pg.amenities, pg.pg_category,
        pg.description, pg.rules, pg.ac_type, pg.room_type, true
      ]);
    }

    console.log('Seeding completed successfully.');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seedData();
