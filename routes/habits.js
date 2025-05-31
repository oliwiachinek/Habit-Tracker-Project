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

    const entry = await Habit.logEntry(req.params.id, req.user.id, entryDate);
    res.status(201).json(entry || {}); 
  } catch (error) {
    console.error('Error logging habit completion:', error);
    res.status(400).json({ error: 'Failed to log habit completion' });
  }
});


router.get('/:id/completed-today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const completed = await Habit.isCompletedToday(req.params.id, req.user.id, today);
    res.json({ completed });
  } catch (error) {
    res.status(500).json({ error: 'Error checking completion status' });
  }
});

router.get('/completions/all', async (req, res) => {
  try {
    const completions = await Habit.getAllCompletions(req.user.id);
    res.json(completions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch habit completions' });
  }
});

router.get('/:id', async (req, res) => {
  const habitId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const habit = await Habit.getByIdWithCompletions(habitId, userId);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/completions/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = await Habit.getTodayCompletions(req.user.id, today);
    res.json({ completedToday });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch today\'s completions' });
  }
});

router.get('/completions/week', async (req, res) => {
  try {
    const completionsThisWeek = await Habit.getCompletionsThisWeek(req.user.id);
    res.json(completionsThisWeek);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch completions for this week' });
  }
});

router.get('/completions/month', async (req, res) => {
  try {
    const completionsThisMonth = await Habit.getCompletionsThisMonth(req.user.id);
    res.json(completionsThisMonth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch completions for this month' });
  }
});

router.get('/completions/year', async (req, res) => {
  try {
    const completionsThisYear = await Habit.getCompletionsThisYear(req.user.id);
    res.json(completionsThisYear);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch completions for this year' });
  }
});



module.exports = router;