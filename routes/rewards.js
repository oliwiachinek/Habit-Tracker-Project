const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    createReward,
    getRewardsByUser,
    redeemReward
} = require('../models/rewards');

const router = express.Router();

const pool = require('../config/db');

router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log("👤 req.user from authMiddleware:", req.user);
        if (!req.user || !req.user.id) throw new Error("User not authenticated");
        
        const rewards = await getRewardsByUser(req.user.id);
        res.json(rewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ message: 'Server error while fetching rewards' });
    }
});

// DELETE /api/rewards/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    const rewardId = req.params.id;
    try {
        await pool.query('DELETE FROM rewards WHERE id = $1 AND user_id = $2', [rewardId, req.user.id]);
        res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        console.error("Error deleting reward:", error);
        res.status(500).json({ message: 'Failed to delete reward' });
    }
});

// PUT /api/rewards/:id
router.put('/:id', authMiddleware, async (req, res) => {
    const rewardId = req.params.id;
    const { title, pointsRequired } = req.body;

    if (!title || typeof pointsRequired !== 'number') {
        return res.status(400).json({ message: 'Invalid reward data' });
    }

    try {
        const result = await pool.query(
            'UPDATE rewards SET title = $1, points_required = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [title, pointsRequired, rewardId, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating reward:", error);
        res.status(500).json({ message: 'Failed to update reward' });
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

    console.log("📥 Incoming reward data:", req.body);
    console.log("👤 Authenticated user:", req.user);


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


