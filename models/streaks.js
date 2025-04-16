const pool = require('../config/db');

const completeHabit = async (habitId, userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const alreadyCompleted = await pool.query(
            `SELECT * FROM habit_completions 
             WHERE habit_id = $1 AND user_id = $2 AND date_completed = $3`,
            [habitId, userId, today]
        );

        if (alreadyCompleted.rows.length > 0) {
            return { message: 'Habit already completed today!' };
        }

        await pool.query(
            `INSERT INTO habit_completions (habit_id, user_id, date_completed)
             VALUES ($1, $2, $3)`,
            [habitId, userId, today]
        );

        await pool.query(
            'UPDATE users SET points = points + 10 WHERE id = $1',
            [userId]
        );

        return { message: 'Habit completed and points awarded!' };
    } catch (error) {
        throw error;
    }
};



const getUserStreaks = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM habits WHERE user_id = $1', [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};


const getUserPoints = async (userId) => {
    try {
        const result = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = { completeHabit, getUserStreaks, getUserPoints };
