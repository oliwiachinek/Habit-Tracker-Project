const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/db');
const User = require('../models/User');

router.use(authMiddleware);

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars'); 
  },
  filename: function (req, file, cb) {
    cb(null, req.params.userId + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const updatedProfile = await User.updateProfileAvatar(userId, avatarPath);

    res.json({ avatar: avatarPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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

    const updatedProfile = await User.updateProfile(userId, fullName, email, avatar);

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/points', async (req, res) => {
  try {
    const points = await User.getUserPoints(req.user.id);
    res.json({ points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
