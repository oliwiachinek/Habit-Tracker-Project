const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Habit = require('../models/Habit');

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
    const entry = await Habit.logEntry(
      req.params.id,
      new Date().toISOString().split('T')[0] 
    );
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;