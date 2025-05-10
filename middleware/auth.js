const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const secret = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, secret);
    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id]);

    if (!user.rows[0]) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
