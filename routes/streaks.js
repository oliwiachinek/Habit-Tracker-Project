const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getUserStreaks } = require('../models/streaks');

const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const streaks = await getUserStreaks(req.user.id);
        res.json(streaks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
