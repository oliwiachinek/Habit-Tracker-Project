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
    const updates = req.body;

    delete updates.join_date;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const profileFields = ['full_name', 'email', 'avatar'];
    const profileUpdates = {};
    profileFields.forEach(field => {
      if (updates[field] !== undefined) profileUpdates[field] = updates[field];
    });

    const setClauseProfile = Object.keys(profileUpdates)
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');
    const valuesProfile = Object.values(profileUpdates);
    valuesProfile.push(userId);

    const updateProfileQuery = `
      UPDATE profiles
      SET ${setClauseProfile}
      WHERE user_id = $${valuesProfile.length}
      RETURNING user_id, full_name, email, avatar, join_date
    `;

    const profileResult = await pool.query(updateProfileQuery, valuesProfile);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profileUpdates.full_name || profileUpdates.email) {
      const fullName = profileUpdates.full_name || profileResult.rows[0].full_name || '';
      const email = profileUpdates.email || profileResult.rows[0].email;

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ') || '';

      const updateUserQuery = `
        UPDATE users
        SET first_name = $1, last_name = $2, email = $3
        WHERE user_id = $4
      `;

      await pool.query(updateUserQuery, [firstName, lastName, email, userId]);
    }

    res.json(profileResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    await User.deleteUser(userId);
    res.json({ message: 'Account deleted successfully' });
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
