CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  UNIQUE (requester_id, recipient_id)
);


CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    points INTEGER DEFAULT 0
);

CREATE TABLE habits (
    habit_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    target_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE habit_entries (
    entry_id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(habit_id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE (habit_id, entry_date)
);

CREATE TABLE habit_streaks (
    streak_id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(habit_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0
);

CREATE TABLE rewards (
    reward_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cost INTEGER NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE special_tasks (
    task_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    points_reward INTEGER
);

INSERT INTO special_task_templates (title, points_reward)
VALUES 
('Go for a 20-minute walk outside', 20),
('Write in your journal this week', 25),
('Stretch for 10 minutes', 30),
('Drink 2L of water every day', 15),
('Try a new healthy recipe', 25);

INSERT INTO special_task_templates (title, points_reward)
VALUES 
('Go for a 2-hour walk in nature', 50),
('Make a handmade present for a friend', 100),
('Borrow and read a book from the library', 30),
('Try a completely new hobby for a day', 15),
('Volunteer for a local community event', 50),
('Write a letter to your future self', 10),
('Visit a museum or art gallery you have never been to', 150),
('Learn and perform a random act of kindness', 200),
('Complete a digital detox for 24 hours', 100),
('Take a class to learn something new', 100),
('Organize a small gathering with friends', 100);

ALTER TABLE profiles
    ADD COLUMN email VARCHAR(100) UNIQUE,
    ADD COLUMN avatar TEXT,
    ADD COLUMN join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

