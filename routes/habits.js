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

router.put('/:id', authMiddleware, async (req, res) => {
    const { streak } = req.body;
    try {
        const habit = await updateHabit(req.params.id, streak);
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const response = await deleteHabit(req.params.id);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
