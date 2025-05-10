const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (firstName, lastName, email, password) => {
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [firstName, lastName, email, hashedPassword]
  );

  const createProfile = async (user_id, full_name, email, avatar = null) => {
    const profileResult = await pool.query(
      'INSERT INTO profiles (user_id, full_name, email, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, full_name, email, avatar]
    );
    return profileResult.rows[0];
  };

  const user = result.rows[0];
  await createProfile(user.user_id, `${firstName} ${lastName}`, email);

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

const updateProfile = async (userId, fullName, email, avatar) => {
  const result = await pool.query(
    'UPDATE profiles SET full_name = $1, email = $2, avatar = $3 WHERE user_id = $4 RETURNING *',
    [fullName, email, avatar, userId]
  );
  return result.rows[0];
};

const updateProfilePoints = async (userId, delta) => {
  const result = await pool.query(
    'UPDATE profiles SET points = points + $1 WHERE user_id = $2 RETURNING points',
    [delta, userId]
  );
  return result.rows[0].points;
};

const updateUserPoints = async (userId, delta) => {
  const updatedPoints = await updateProfilePoints(userId, delta);
  return { points: updatedPoints };
};

const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT profiles.*, users.email 
     FROM profiles 
     JOIN users ON profiles.user_id = users.user_id
     WHERE profiles.user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

module.exports = { registerUser, loginUser, updateUserPoints, updateProfile };
