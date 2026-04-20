require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const meals = [
  { type: "Breakfast", items: ["Idli Sambar", "Poha", "Aloo Paratha", "Bread Omelette", "Dosa", "Poori Sabzi", "Upma"] },
  { type: "Lunch", items: ["Rice, Dal, Sabzi", "Veg Biryani", "Chole Bhature", "Paneer Butter Masala", "Rajma Chawal", "Chicken Curry", "Thali"] },
  { type: "Dinner", items: ["Roti, Sabzi, Dal", "Egg Curry", "Dal Makhani", "Fried Rice", "Mixed Veg", "Kadai Paneer", "Khichdi"] }
];

async function seedFoodMenu() {
  console.log('Fetching PGs to seed food menu...');
  const { data: pgs, error } = await supabase.from('pgs').select('pg_id');
  if (error) {
    console.error('Error fetching PGs:', error);
    return;
  }

  console.log(`Seeding food menu for ${pgs.length} PGs...`);
  
  let totalAdded = 0;
  for (const pg of pgs) {
    const records = [];
    
    days.forEach((day, dayIndex) => {
      meals.forEach((meal) => {
        records.push({
          pg_id: pg.pg_id,
          day_of_week: day,
          meal_type: meal.type,
          items: meal.items[dayIndex % meal.items.length],
          timing: meal.type === "Breakfast" ? "8:00 AM" : meal.type === "Lunch" ? "1:30 PM" : "8:30 PM"
        });
      });
    });

    const { error: insertError } = await supabase.from('food_menu').insert(records);
    if (insertError) {
      console.error(`Error seeding menu for PG ${pg.pg_id}:`, insertError);
    } else {
      totalAdded += records.length;
    }
  }

  console.log(`Seeding complete. Added ${totalAdded} menu items.`);
}

seedFoodMenu();
