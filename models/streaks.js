const pool = require('../config/db');

const getUserStreaks = async (userId) => {
    const habits = await pool.query(
        'SELECT habit_id, name FROM habits WHERE user_id = $1 AND category = $2',
        [userId, 'daily']
    );

    const data = [];

    for (let habit of habits.rows) {
        const completions = await pool.query(
            'SELECT date_completed FROM habit_completions WHERE habit_id = $1 AND user_id = $2 ORDER BY date_completed',
            [habit.habit_id, userId]
        );

        const dates = completions.rows.map(row => new Date(row.date_completed));
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const completedDays = dates
            .filter(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear)
            .map(d => d.getDate());

        if (dates.length === 0) {
            data.push({
                id: habit.habit_id,
                name: habit.name,
                current_streak: 0,
                longest_streak: 0,
                start_date: null,
                end_date: null,
                completedDays
            });
            continue;
        }

        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        let longestStreakStartDate = dates[0];
        let longestStreakEndDate = dates[0];

        for (let i = 1; i < dates.length; i++) {
            const prevDate = dates[i - 1];
            const currentDate = dates[i];

            const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                tempStreak++;
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                    longestStreakStartDate = new Date(dates[i - tempStreak + 1]);
                    longestStreakEndDate = currentDate;
                }
            } else {
                tempStreak = 1;
            }
        }

        const lastCompletionDate = dates[dates.length - 1];
        const today = new Date();
        const diffLast = Math.floor((today - lastCompletionDate) / (1000 * 60 * 60 * 24));
        if (diffLast === 0) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }

        await upsertHabitStreak(
        habit.habit_id,
        currentStreak,
        longestStreak,
        longestStreakStartDate,
        longestStreakEndDate
        );

        data.push({
        id: habit.habit_id,
        name: habit.name,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        start_date: longestStreakStartDate,
        end_date: longestStreakEndDate,
        completedDays
        });

    }

    return data;
};

const upsertHabitStreak = async (habitId, currentStreak, longestStreak, startDate, endDate) => {
  const updateQuery = `
    UPDATE habit_streaks
    SET current_streak = $2,
        longest_streak = $3,
        start_date = $4,
        end_date = $5
    WHERE habit_id = $1
  `;

  const updateResult = await pool.query(updateQuery, [habitId, currentStreak, longestStreak, startDate, endDate]);

  if (updateResult.rowCount === 0) {
    const insertQuery = `
      INSERT INTO habit_streaks (habit_id, current_streak, longest_streak, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(insertQuery, [habitId, currentStreak, longestStreak, startDate, endDate]);
  }
};



module.exports = { getUserStreaks };
