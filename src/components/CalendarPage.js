import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskPoints, setNewTaskPoints] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', {month: 'long'});
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const currentDay = currentDate.getDate();

    useEffect(() => {
        const fetchUserPoints = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch('http://localhost:5000/api/profile/points', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`}
                });

                if (!response.ok) throw new Error('Failed to fetch user points');

                const data = await response.json();
                setTotalPoints(data.points);
            } catch (error) {
                console.error('Error fetching user points', error);
            }
        };

        fetchUserPoints();
    }, []);

    useEffect(() => {
        const fetchDailyHabitsWithCompletions = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch('http://localhost:5000/api/habits', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`}
                });
                if (!res.ok) throw new Error('Failed to fetch habits');
                const data = await res.json();
                const dailyHabits = data.filter(habit => habit.category === 'daily');

                const compRes = await fetch('http://localhost:5000/api/habits/completions/all', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`}
                });
                if (!compRes.ok) throw new Error('Failed to fetch completions');
                const completionsData = await compRes.json();

                const completionsMap = {};
                completionsData.forEach(c => {
                    const date = new Date(c.date_completed).getDate(); // extract day only
                    if (!completionsMap[c.habit_id]) completionsMap[c.habit_id] = new Set();
                    completionsMap[c.habit_id].add(date);
                });

                const habitsWithCompletions = dailyHabits.map(habit => ({
                    ...habit,
                    completedDays: Array.from(completionsMap[habit.habit_id] || [])
                }));

                setTasks(habitsWithCompletions);
            } catch (err) {
                console.error('Error fetching daily habits with completions:', err);
            }
        };

        fetchDailyHabitsWithCompletions();
    }, []);

    const toggleTaskCompletion = async (taskId, day) => {
        try {
            const token = localStorage.getItem('token');
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    const alreadyCompleted = task.completedDays.includes(day);
                    const updatedDays = alreadyCompleted
                        ? task.completedDays
                        : [...task.completedDays, day];
                    return {...task, completedDays: updatedDays};
                }
                return task;
            });

            setTasks(updatedTasks);

            const date = new Date(currentYear, currentDate.getMonth(), day);
            const formattedDate = date.toISOString().split('T')[0];

            if (!tasks.find(t => t.id === taskId).completedDays.includes(day)) {
                await fetch(`http://localhost:5000/api/habits/${taskId}/entries`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({date: formattedDate})
                });

                const task = tasks.find(t => t.id === taskId);
                setTotalPoints(prev => prev + task.points);
            }
        } catch (error) {
            console.error('Error updating completion:', error);
        }
    };

    const calculateTaskCompletion = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const completedCount = task?.completedDays?.length || 0;
        return Math.round((completedCount / daysInMonth) * 100);
    };

    const handleAddTask = async () => {
        if (newTaskName.trim() && newTaskPoints) {
            try {
                const taskData = {
                    name: newTaskName,
                    category: 'daily',
                    points: parseInt(newTaskPoints),
                    schedule: {days: []}
                };

                const response = await fetch('http://localhost:5000/api/habits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(taskData)
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error || 'Failed to create habit');

                setNewTaskName('');
                setNewTaskPoints('');
                setShowAddTask(false);
            } catch (error) {
                console.error('Error adding task:', error);
                alert('There was a problem adding the task.');
            }
        }
    };

    return (
        <div className="task-container">
            <header>
                <div className="header-left">
                    <h1>{currentMonth} {currentYear}</h1>
                    <div className="points-display">Total Points: {totalPoints}</div>
                </div>
                <nav>
                    <Link to="/taskpage" className="nav-button">Tasks</Link>
                    <Link to="/calendar" className="nav-button active">Calendar</Link>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <Link to="/rewards" className="nav-button">Rewards</Link>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>

            <div className="calendar-wrapper">
                <div className="sidebar">
                    <button className="add-task-btn" onClick={() => setShowAddTask(true)}>+ Add Task</button>
                    {showAddTask && (
                        <div className="add-task-form">
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="Enter task name"
                            />
                            <input
                                type="number"
                                value={newTaskPoints}
                                onChange={(e) => setNewTaskPoints(e.target.value)}
                                placeholder="Enter points"
                            />
                            <div className="add-task-buttons">
                                <button onClick={handleAddTask}>Save</button>
                                <button onClick={() => setShowAddTask(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="calendar-table">
                    <div className="calendar-row header-row">
                        <div className="task-cell header-cell">Task</div>
                        {days.map(day => (
                            <div key={day}
                                 className={`day-cell header-cell ${day === currentDay ? 'current-day' : ''}`}>
                                {day}
                            </div>
                        ))}
                        <div className="completion-cell header-cell">%</div>
                    </div>

                    {tasks.map(task => (
                        <div key={task.id} className="calendar-row">
                            <div className="task-cell">
                                <div className="task-name">{task.name}</div>
                                <div className="task-points">{task.points}p</div>
                            </div>
                            {days.map(day => (
                                <div
                                    key={day}
                                    className={`day-cell calendar-box ${task.completedDays.includes(day) ? 'completed' : ''}`}
                                    onClick={() => {
                                        if (!task.completedDays.includes(day)) {
                                            toggleTaskCompletion(task.id, day);
                                        }
                                    }}
                                ></div>
                            ))}
                            <div className="completion-cell">
                                {calculateTaskCompletion(task.id)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
