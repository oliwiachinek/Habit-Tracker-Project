const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 


router.post('/', async (req, res) => {
  const { user_id, title, expires_at, points_reward } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO special_tasks (user_id, title, expires_at, points_reward)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, expires_at, points_reward]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to create special task' });
  }
});

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
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No available special tasks' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!['completed', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE special_tasks SET status = $1 WHERE task_id = $2 RETURNING *`,
      [status, taskId]
    );
    res.json(result.rows[0]);
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
