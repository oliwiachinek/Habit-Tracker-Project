const express = require('express');
const authMiddleware = require('../middleware/auth');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const {
    createReward,
    getRewardsByUser,
    redeemReward,
} = require('../models/rewards');

const router = express.Router();
const pool = require('../config/db');

const rewardsDir = path.join(__dirname, '..', 'uploads', 'rewards');
if (!fs.existsSync(rewardsDir)) {
    fs.mkdirSync(rewardsDir, { recursive: true });
}

async function downloadImage(url, filepath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to download image');
    const buffer = await res.buffer();
    await fs.promises.writeFile(filepath, buffer);
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.id) throw new Error("User not authenticated");
        const rewards = await getRewardsByUser(req.user.id);
        res.json(rewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ message: 'Server error while fetching rewards' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const rewardId = req.params.id;
    try {
        await pool.query('DELETE FROM rewards WHERE reward_id = $1 AND user_id = $2', [rewardId, req.user.id]);
        res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        console.error("Error deleting reward:", error);
        res.status(500).json({ message: 'Failed to delete reward' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { name, cost, image } = req.body;

    if (!name || typeof cost !== 'number') {
        return res.status(400).json({ message: 'Invalid reward data' });
    }
    if (cost < 0) {
        return res.status(400).json({ message: 'Points required cannot be negative' });
    }

    try {
        const reward = await createReward(req.user.id, name, cost, image);

        if (image) {
            const filepath = path.join(rewardsDir, `reward${reward.reward_id}.png`);
            await downloadImage(image, filepath);
        }

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
