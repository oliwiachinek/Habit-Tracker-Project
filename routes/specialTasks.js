const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 

router.get('/random/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM special_tasks
       WHERE user_id = $1
         AND status = 'pending'
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    const templatesRes = await pool.query(`SELECT * FROM special_task_templates`);
    const templates = templatesRes.rows;

    if (templates.length === 0) {
      return res.status(404).json({ message: 'No special task templates found' });
    }

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expiresAt = new Date(firstDayOfMonth);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const insertRes = await pool.query(
      `INSERT INTO special_tasks (user_id, title, expires_at, points_reward, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [userId, randomTemplate.title, expiresAt, randomTemplate.points_reward]
    );

    return res.json(insertRes.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch or create special task' });
  }
});


router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (status !== "completed") {
    return res.status(400).json({ error: 'Only "completed" status can be set via this route' });
  }

  try {
    const taskResult = await pool.query(
      `SELECT status FROM special_tasks WHERE task_id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const currentStatus = taskResult.rows[0].status;

    if (currentStatus === "completed" || currentStatus === "failed") {
      return res.status(400).json({ error: `Cannot update task: current status is already "${currentStatus}"` });
    }

    const updateResult = await pool.query(
      `UPDATE special_tasks SET status = 'completed' WHERE task_id = $1 RETURNING *`,
      [taskId]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});


router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM special_tasks WHERE user_id = $1 ORDER BY expires_at`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
});

module.exports = router;
