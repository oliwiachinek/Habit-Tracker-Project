const pool = require('../db');

const completeHabit = async (habitId, userId) => {
    try {
        // Update streak count
        const habit = await pool.query('SELECT streak FROM habits WHERE id = $1', [habitId]);
        const newStreak = habit.rows[0].streak + 1;

        await pool.query(
            'UPDATE habits SET streak = $1 WHERE id = $2 RETURNING *',
            [newStreak, habitId]
        );

      
        await pool.query('UPDATE users SET points = points + 10 WHERE id = $1', [userId]);

        return { message: 'Habit completed, streak increased, and points added!' };
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
