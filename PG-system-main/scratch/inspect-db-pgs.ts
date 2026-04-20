
async function inspectLivePGs() {
  try {
    const response = await fetch('http://localhost:3000/api/pgs');
    const data = await response.json();
    console.log('--- Live PGs Data ---');
    data.forEach((pg: any) => {
      console.log(`ID: ${pg.pg_id}, Name: ${pg.pg_name}, Room Type: [${pg.room_type}], AC: [${pg.ac}]`);
    });
  } catch (error) {
    console.error('Failed to fetch live PGs:', error);
  }
}

inspectLivePGs();
