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

    const fetchTasksAndCompletions = async () => {
        try {
            const token = localStorage.getItem('token');

            const habitsRes = await fetch('http://localhost:5000/api/habits', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const habitsData = await habitsRes.json();

            console.log('Fetched habits:', habitsData);

            const dailyTasks = habitsData.filter(task => task.schedule === 'daily');

            const completionsRes = await fetch('http://localhost:5000/api/habits/completions/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const completionsData = await completionsRes.json();

            console.log('Fetched completions:', completionsData);

            const tasksWithCompletedDays = dailyTasks.map(task => {
                const completedDays = completionsData
                    .filter(c => c.habit_id === task.id)
                    .map(c => {
                        const date = new Date(c.date_completed);
                        return date.getDate();
                    });

                return {
                    ...task,
                    completedDays: completedDays
                };
            });

            console.log('Tasks with completed days:', tasksWithCompletedDays);

            setTasks(tasksWithCompletedDays);

            let initialPoints = 0;
            tasksWithCompletedDays.forEach(task => {
                initialPoints += task.completedDays.length * task.points;
            });
            setTotalPoints(initialPoints);
        } catch (error) {
            console.error('Error fetching tasks or completions:', error);
        }
    };


    const toggleTaskCompletion = async (taskId, day) => {
        try {
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    const wasCompleted = task.completedDays.includes(day);
                    let updatedDays;

                    if (wasCompleted) {
                        updatedDays = task.completedDays.filter(d => d !== day);
                        setTotalPoints(prev => prev - task.points);
                    } else {
                        updatedDays = [...task.completedDays, day];
                        setTotalPoints(prev => prev + task.points);
                    }

                    console.log(`Task ID: ${taskId}, Updated Completed Days:`, updatedDays);
                    return {...task, completedDays: updatedDays};
                }
                return task;
            });

            setTasks(updatedTasks);

            const token = localStorage.getItem('token');
            const date = new Date();
            date.setDate(day);
            const formattedDate = date.toISOString().split('T')[0];

            if (updatedTasks.find(t => t.id === taskId).completedDays.includes(day)) {
                console.log(`Posting completion for Task ID: ${taskId} on ${formattedDate}`);
                await fetch(`http://localhost:5000/api/habits/${taskId}/entries`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({date: formattedDate})
                });
            } else {
                console.warn('Unmarking not supported in backend yet.');
            }
        } catch (error) {
            console.error('Error updating completion:', error);
        }
    };


    const calculateTaskCompletion = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const completedCount = task.completedDays.length;
        return Math.round((completedCount / daysInMonth) * 100);
    };

    const calculateOverallCompletion = () => {
        const totalPossible = tasks.length * daysInMonth;
        const totalCompleted = tasks.reduce((sum, task) => sum + task.completedDays.length, 0);
        return Math.round((totalCompleted / totalPossible) * 100);
    };

    const handleAddTask = async () => {
        if (newTaskName.trim() && newTaskPoints) {
            try {
                const schedule = {days: []};

                const taskData = {
                    name: newTaskName,
                    category: 'daily',
                    points: parseInt(newTaskPoints),
                    schedule
                };

                console.log('New task data:', taskData);

                const response = await fetch('http://localhost:5000/api/habits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(taskData)
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Backend error message:', data.error);
                    throw new Error('Failed to create habit');
                }

                console.log('Created task response:', data);

                await fetchTasksAndCompletions();

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
                    <div className="task-list">
                        <h2>Tasks</h2>
                        {tasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div className="task-name">{task.name}</div>
                                <div className="task-points">{task.points}p</div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="add-task-btn"
                        onClick={() => setShowAddTask(true)}
                    >
                        + Add Task
                    </button>
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
                            <div
                                key={day}
                                className={`day-cell header-cell ${day === currentDay ? 'current-day' : ''}`}
                            >
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
                                    className={`day-cell ${task.completedDays.includes(day) ? 'completed' : ''}`}
                                    onClick={() => toggleTaskCompletion(task.id, day)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={task.completedDays.includes(day)}
                                        onChange={() => toggleTaskCompletion(task.id, day)}
                                    />
                                </div>
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
}
export default CalendarPage;