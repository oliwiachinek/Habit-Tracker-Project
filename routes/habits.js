const express = require('express');
const router = express.Router();
const { createHabit, getHabitsByUser } = require('../models/Habit');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { name, frequency, targetCount } = req.body;
    const habit = await createHabit(req.user.id, name, frequency, targetCount);
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const habits = await getHabitsByUser(req.user.id);
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;