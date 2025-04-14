const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (email, password, lastName, firstName) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, last_Name, first_Name) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, hashedPassword, lastName, firstName]
  );
  const user = result.rows[0];
  const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token };
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