const pool = require('../config/db');

const createHabit = async (userId, name, frequency, targetCount) => {
  const result = await pool.query(
    'INSERT INTO habits (user_id, name, frequency, target_count) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, name, frequency, targetCount]
  );
  return result.rows[0];
};

const getHabitsByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM habits WHERE user_id = $1',
    [userId]
  );
  return result.rows;
};

module.exports = { createHabit, getHabitsByUser };