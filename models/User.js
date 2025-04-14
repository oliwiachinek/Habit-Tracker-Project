const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (firstName, lastName, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [firstName, lastName, email, hashedPassword]
  );
  const createProfile = async (user_id, full_name, email, avatar) => {
    const result = await pool.query(
        'INSERT INTO profiles (user_id, full_name, email, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, full_name, email, avatar]
    );
    return result.rows[0];
};

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