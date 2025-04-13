const pool = require('../config/db');

const Habit = {
  async create(userId, name, category, points, schedule) {
    const result = await pool.query(
      `INSERT INTO habits 
        (user_id, name, category, points, schedule)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, category, points, schedule]
    );
    return result.rows[0];
  },

  async findByUser(userId) {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  },

  async logEntry(habitId, date) {
    const result = await pool.query(
      `INSERT INTO habit_entries 
        (habit_id, entry_date, is_completed)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [habitId, date, true]
    );
    return result.rows[0];
  }
};

module.exports = Habit;