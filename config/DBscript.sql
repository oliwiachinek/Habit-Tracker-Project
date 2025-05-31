CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name Text,
    last_name TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
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
    category VARCHAR(20) NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'yearly')),
    one_time BOOLEAN default false,
    points INTEGER NOT NULL DEFAULT 0,
    schedule JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE habit_streaks (
    streak_id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(habit_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0
);

CREATE TABLE habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(habit_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    date_completed DATE NOT NULL
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
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    points_reward INTEGER
);

CREATE TABLE special_task_templates (
    template_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    points_reward INTEGER NOT NULL
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

