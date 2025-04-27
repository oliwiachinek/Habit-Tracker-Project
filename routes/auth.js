const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password} = req.body;
    const user = await registerUser(firstName, lastName, email, password);
    res.status(201).json(user);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (error) {
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