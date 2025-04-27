const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    createReward,
    getRewardsByUser,
    redeemReward
} = require('../models/rewards');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.id) throw new Error("User not authenticated");
        const rewards = await getRewardsByUser(req.user.id);
        res.json(rewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ message: 'Server error while fetching rewards' });
    }
});

const completeHabit = async (habitId, userId) => {
  const habit = await pool.query('SELECT streak FROM habits WHERE id = $1', [habitId]);
  const newStreak = habit.rows[0].streak + 1;

  await pool.query('UPDATE habits SET streak = $1 WHERE id = $2', [newStreak, habitId]);
  await pool.query('UPDATE users SET points = points + 10 WHERE id = $1', [userId]);

  return { message: 'Habit completed, streak increased, and points added!' };
};



router.post('/', authMiddleware, async (req, res) => {
    const { title, pointsRequired } = req.body;

    if (!title || typeof pointsRequired !== 'number') {
        return res.status(400).json({ message: 'Invalid reward data' });
    }

    try {
        const reward = await createReward(req.user.id, title, pointsRequired);
        res.status(201).json(reward);
    } catch (error) {
        console.error("Error creating reward:", error);
        res.status(500).json({ message: 'Server error while creating reward' });
    }
});


router.post('/redeem/:id', authMiddleware, async (req, res) => {
    try {
        const response = await redeemReward(req.user.id, req.params.id);
        res.json(response);
    } catch (error) {
        console.error("Error redeeming reward:", error);
        res.status(400).json({ message: error.message || 'Failed to redeem reward' });
    }
});

module.exports = router;
