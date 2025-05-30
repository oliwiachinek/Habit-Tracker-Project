import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
    const [tasks, setTasks] = useState([
        { id: 1, name: 'Wake up at 6', completedDays: [], points: 10 },
        { id: 2, name: 'Skincare', completedDays: [], points: 5 },
        { id: 3, name: 'Journaling', completedDays: [], points: 15 },
        { id: 4, name: 'Do 10k steps', completedDays: [], points: 20 },
        { id: 5, name: 'Study', completedDays: [], points: 25 },
        { id: 6, name: 'Drink 2L of water', completedDays: [], points: 10 },
        { id: 7, name: 'Do dishes', completedDays: [], points: 5 }
    ]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskPoints, setNewTaskPoints] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const currentDay = currentDate.getDate();

    const toggleTaskCompletion = (taskId, day) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                const wasCompleted = task.completedDays.includes(day);
                const updatedDays = wasCompleted
                    ? task.completedDays.filter(d => d !== day)
                    : [...task.completedDays, day];

                if (wasCompleted) {
                    setTotalPoints(prev => prev - task.points);
                } else {
                    setTotalPoints(prev => prev + task.points);
                }

                return { ...task, completedDays: updatedDays };
            }
            return task;
        }));
    };

    const calculateTaskCompletion = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const completedCount = task.completedDays.length;
        return Math.round((completedCount / daysInMonth) * 100);
    };


    const handleAddTask = () => {
        if (newTaskName.trim() && newTaskPoints) {
            const newTask = {
                id: tasks.length + 1,
                name: newTaskName,
                completedDays: [],
                points: parseInt(newTaskPoints)
            };
            setTasks([...tasks, newTask]);
            setNewTaskName('');
            setNewTaskPoints('');
            setShowAddTask(false);
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
                    <button className="active">Calendar</button>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <Link to="/rewards" className="nav-button">Rewards</Link>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>

            <div className="calendar-wrapper">
                <div className="calendar-header">
                    <div className="completion-info">
                        <button
                            className="add-task-btn"
                            onClick={() => setShowAddTask(true)}
                        >
                            + Add Task
                        </button>
                    </div>
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
                                    {task.completedDays.includes(day) ? '✓' : ''}
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
};

export default CalendarPage;