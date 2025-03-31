const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createReward, getRewardsByUser, redeemReward } = require('../models/rewards');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const rewards = await getRewardsByUser(req.user.id);
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { title, pointsRequired } = req.body;
    try {
        const reward = await createReward(req.user.id, title, pointsRequired);
        res.status(201).json(reward);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/redeem/:id', authMiddleware, async (req, res) => {
    try {
        const response = await redeemReward(req.user.id, req.params.id);
        res.json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
