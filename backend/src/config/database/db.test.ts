import pool from './db.config';

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Current timestamp from DB:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err);
    return false;
  }
}