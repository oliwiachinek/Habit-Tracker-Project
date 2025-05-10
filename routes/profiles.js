const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/db');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const profile = await User.getUserProfile(req.user.id); 
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, avatar } = req.body;

    const updatedProfile = await updateProfile(userId, fullName, email, avatar);
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
