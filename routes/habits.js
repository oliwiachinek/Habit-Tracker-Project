const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Habit = require('../models/Habit');
const pool = require('../config/db');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, points, schedule } = req.body;
    const habit = await Habit.create(req.user.id, name, category, points, schedule);
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.findByUser(req.user.id);
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/entries', async (req, res) => {
  try {
    const { date } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];  

    const entry = await pool.query(
      `INSERT INTO habit_completions (habit_id, user_id, date_completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, user_id, date_completed) DO NOTHING`, 
      [req.params.id, req.user.id, entryDate]
    );

    res.status(201).json(entry.rows[0]); 
  } catch (error) {
    console.error('Error logging habit completion:', error);
    res.status(400).json({ error: 'Failed to log habit completion' });
  }
});




router.get('/:id/completed-today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT * FROM habit_completions
       WHERE habit_id = $1 AND user_id = $2 AND date_completed = $3`,
      [req.params.id, req.user.id, today]
    );

    res.json({ completed: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error checking completion status' });
  }
});

router.get('/completions/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM habit_completions WHERE user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch habit completions' });
  }
});



module.exports = router;