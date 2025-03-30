const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'habit_tracker_db',
  password: process.env.DB_PASSWORD || 'thisisagoodpassword',
  port: process.env.DB_PORT || 5432,
  ssl : false,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error', err));

module.exports = pool;
