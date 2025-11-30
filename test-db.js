const db = require('./src/config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const res = await db.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
    
    console.log('Testing Assets table...');
    const assets = await db.query('SELECT count(*) FROM assets');
    console.log('Assets count:', assets.rows[0].count);

    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
