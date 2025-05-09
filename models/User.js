const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (firstName, lastName, email, password) => {
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  console.log(existingUser.rows);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [firstName, lastName, email, hashedPassword]
  );
  const user = result.rows[0];

  await pool.query(
    'INSERT INTO profiles (user_id, full_name, email, avatar) VALUES ($1, $2, $3, $4)',
    [user.user_id, `${user.first_name} ${user.last_name}`, user.email, 'default-avatar.png']
  );

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

  const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return token;
};


module.exports = { registerUser, loginUser };
