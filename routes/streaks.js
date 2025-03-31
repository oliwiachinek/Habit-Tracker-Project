const express = require('express');
const authMiddleware = require('../middleware/auth');
const { completeHabit, getUserStreaks, getUserPoints } = require('../models/streaks');

const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const streaks = await getUserStreaks(req.user.id);
        res.json(streaks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/complete/:habitId', authMiddleware, async (req, res) => {
    try {
        const response = await completeHabit(req.params.habitId, req.user.id);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/points', authMiddleware, async (req, res) => {
    try {
        const points = await getUserPoints(req.user.id);
        res.json(points);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
