const pool = require('../config/db');

const getUserStreaks = async (userId) => {
    const habits = await pool.query('SELECT habit_id, name FROM habits WHERE user_id = $1', [userId]);

    const data = [];

    for (let habit of habits.rows) {
        const completions = await pool.query(
            'SELECT date_completed FROM habit_completions WHERE habit_id = $1 AND user_id = $2',
            [habit.habit_id, userId]
        );

        data.push({
            id: habit.habit_id,
            name: habit.title,
            completedDays: completions.rows.map(row => new Date(row.date_completed).getDate()),
        });
    }

    return data;
};

module.exports = {  getUserStreaks };

