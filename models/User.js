const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword]
  );
  return result.rows[0];
};

const loginUser = async (email, password) => {
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!user.rows[0]) throw new Error('User not found');

  const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!isValid) throw new Error('Invalid password');

  const token = jwt.sign({ id: user.rows[0].user_id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

module.exports = { registerUser, loginUser };