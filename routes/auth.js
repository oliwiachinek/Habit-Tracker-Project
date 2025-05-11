const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');
const { loginUser } = require('../models/User'); 

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [firstName, lastName, email, hashedPassword]
    );

    const id = result.rows[0].id;

    return res.status(200).json({ message: 'User registered successfully', user_id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log("🔐 Login attempt with:", req.body);
    const { email, password } = req.body;

    const token = await loginUser(email, password);
    console.log("✅ Login successful. Token:", token);
    res.json({ token });

  } catch (error) {
    console.error("❌ Login error:", error.message);

    if (error.message === 'User not found') {
      res.status(400).json({ message: 'Email not connected to an account.' });
    } else if (error.message === 'Invalid password') {
      res.status(400).json({ message: 'Incorrect password.' });
    } else {
      res.status(500).json({ message: 'Something went wrong, please try again.' });
    }
  }
});


module.exports = router;
