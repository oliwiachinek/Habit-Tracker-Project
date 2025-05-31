require('dotenv').config();
require('./specialTaskScheduler'); 

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const specialTasksRoutes = require('./routes/specialTasks');
const rewardRoutes = require('./routes/rewards');
const streakRoutes = require('./routes/streaks');
const profileRoutes = require('./routes/profiles');
const friendRoutes = require('./routes/friends');

app.use('/api/friends', friendRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/profile', profileRoutes);
app.use('/specialTasks', specialTasksRoutes);

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
