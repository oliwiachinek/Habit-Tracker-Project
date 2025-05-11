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

  async logEntry(habitId, userId, date) {
    const result = await pool.query(
      `INSERT INTO habit_completions (habit_id, user_id, date_completed)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING *`,
      [habitId, userId, date]
    );

    if (result.rows.length > 0) {
      const habit = await pool.query(
        `SELECT points FROM habits WHERE habit_id = $1`,
        [habitId]
      );

      const habitPoints = habit.rows[0]?.points || 0;

      await pool.query(
        `UPDATE profiles SET points = points + $1 WHERE user_id = $2`,
        [habitPoints, userId]
      );
    }
    return result.rows[0];
  },

  async isCompletedToday(habitId, userId, date) {
    const result = await pool.query(
      `SELECT * FROM habit_completions
       WHERE habit_id = $1 AND user_id = $2 AND date_completed = $3`,
      [habitId, userId, date]
    );
    return result.rows.length > 0;
  },

  async getAllCompletions(userId) {
    const result = await pool.query(
      `SELECT * FROM habit_completions WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }
};

module.exports = Habit;