const pool = require('../config/db');

const Habit = {
  async create(userId, name, category, points, schedule) {
    if (typeof points !== 'number' || isNaN(points) || points < 0) {
      throw new Error('Points must be a non-negative number');
    }
    
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
  },

  async getByIdWithCompletions(habitId, userId) {
  const habitResult = await pool.query(
    `SELECT * FROM habits WHERE habit_id = $1 AND user_id = $2`,
    [habitId, userId]
  );

  if (habitResult.rows.length === 0) {
    return null; 
  }

  const completionsResult = await pool.query(
    `SELECT date_completed FROM habit_completions
     WHERE habit_id = $1 AND user_id = $2
     ORDER BY date_completed ASC`,
    [habitId, userId]
  );

  const habit = habitResult.rows[0];
  habit.completions = completionsResult.rows.map(row => row.date_completed);

  return habit;
 },

 async findByUserWithCompletions(userId) {
  const habits = await this.findByUser(userId);

  const habitsWithCompletions = await Promise.all(
    habits.map(async habit => {
      const completionsResult = await pool.query(
        `SELECT date_completed FROM habit_completions
         WHERE habit_id = $1 AND user_id = $2`,
        [habit.habit_id, userId]
      );
      habit.completions = completionsResult.rows.map(r => r.date_completed);
      return habit;
    })
  );

  return habitsWithCompletions;
},

async getTodayCompletions(userId, date) {
  const result = await pool.query(
    `SELECT habit_id FROM habit_completions 
     WHERE user_id = $1 AND date_completed = $2`,
    [userId, date]
  );
  return result.rows.map(r => r.habit_id);
},

  async getCompletionsThisWeek(userId) {
    const result = await pool.query(
      `SELECT * FROM habit_completions
       WHERE user_id = $1 AND date_completed >= date_trunc('week', CURRENT_DATE)`,
      [userId]
    );
    return result.rows;
  },

  async getCompletionsThisMonth(userId) {
    const result = await pool.query(
      `SELECT * FROM habit_completions
       WHERE user_id = $1 AND date_completed >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    return result.rows;
  },

  async getCompletionsThisYear(userId) {
    const result = await pool.query(
      `SELECT * FROM habit_completions
       WHERE user_id = $1 AND date_completed >= date_trunc('year', CURRENT_DATE)`,
      [userId]
    );
    return result.rows;
  }

 
};

module.exports = Habit;