const cron = require('node-cron');
const pool = require('./config/db');


cron.schedule('0 8 * * 1', async () => {
  console.log('Assigning monthly special tasks to all users...');

  try {
    const usersRes = await pool.query(`SELECT user_id FROM users`);
    const users = usersRes.rows;

    const templatesRes = await pool.query(`SELECT * FROM special_task_templates`);
    const templates = templatesRes.rows;

    if (templates.length === 0) {
      console.warn(' No templates found, skipping task assignment.');
      return;
    }

    for (const user of users) {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const existing = await pool.query(
        `SELECT * FROM special_tasks
         WHERE user_id = $1 AND created_at >= $2`,
        [user.user_id, firstDayOfMonth]
      );

      if (existing.rows.length === 0) {
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

        const expiresAt = new Date(firstDayOfMonth);
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await pool.query(
          `INSERT INTO special_tasks (user_id, title, expires_at, points_reward, status)
           VALUES ($1, $2, $3, $4, 'pending')`,
          [user.user_id, randomTemplate.title, expiresAt, randomTemplate.points_reward]
        );

        console.log(`Assigned "${randomTemplate.title}" to user ${user.user_id}`);
      } else {
        console.log(`User ${user.user_id} already has a task this month.`);
      }
    }

  } catch (err) {
    console.error('Error assigning special task:', err);
  }
});
