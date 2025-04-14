import React, { useState, useEffect } from 'react';
import '../styles/TaskPage.css';
import { Link } from 'react-router-dom';
const TaskBox = ({ title, tasks, onAddTask, onTaskComplete }) => {
    return (
        <div className="task-box">
            <h2>{title}</h2>
            <button className="add-btn" onClick={() => onAddTask(title)}>+</
                button>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task.special && <span className="crown-icon">
�
</span>}
                        <span className={task.special ? "special-task" : ""}>
 {task.name}
 </span>
                        <span className="points">{task.points}p</span>
                        <input
                            type="checkbox"
                            onChange={(e) => onTaskComplete(title, index,
                                e.target.checked)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};
const specialMonthlyTasks = [
    "Go for a 2-hour walk in nature",
    "Make a handmade present for a friend"
];
export default function TaskPage() {
    const [date, setDate] = useState(new Date().toLocaleDateString());
    const [showPopup, setShowPopup] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskPoints, setTaskPoints] = useState("");
    const [tasks, setTasks] = useState({
        "Daily Tasks": [],
        "Weekly Tasks": [],
        "Monthly Tasks": [
            {
                name: specialMonthlyTasks[new Date().getMonth() %
                specialMonthlyTasks.length],
                points: "50",
                special: true
            }
        ],
        "Yearly Tasks": []
    });
    const [currentCategory, setCurrentCategory] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedWeeks, setSelectedWeeks] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [newWeek, setNewWeek] = useState("");
    const [newMonth, setNewMonth] = useState("");
    const [newYear, setNewYear] = useState("");
    const [isOneTimeTask, setIsOneTimeTask] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    const [message, setMessage] = useState('');
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('en-US', { month: 'long' })
    );
    useEffect(() => {
        // Fetch tasks from backend when component mounts
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch('http://localhost:5000/api/habits', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch tasks');
                const data = await res.json();
                // Transform backend data to match frontend structure
                const transformedTasks = {
                    "Daily Tasks": [],
                    "Weekly Tasks": [],
                    "Monthly Tasks": [
                        {
                            name: specialMonthlyTasks[new Date().getMonth() %
                            specialMonthlyTasks.length],
                            points: "50",
                            special: true
                        }
                    ],
                    "Yearly Tasks": []
                };
                data.forEach(task => {
                    const taskObj = {
                        name: task.name,
                        points: task.points,
                        _id: task._id
                    };
                    if (task.category === 'daily') {
                        transformedTasks["Daily Tasks"].push(taskObj);
                    } else if (task.category === 'weekly') {
                        transformedTasks["Weekly Tasks"].push(taskObj);
                    } else if (task.category === 'monthly') {
                        transformedTasks["Monthly Tasks"].push(taskObj);
                    } else if (task.category === 'yearly') {
                        transformedTasks["Yearly Tasks"].push(taskObj);
                    }
                });
                setTasks(transformedTasks);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setMessage('Error fetching tasks');
            }
        };
        fetchTasks();
    }, []);
    const handleAddTask = (category) => {
        setCurrentCategory(category);
        setSelectedDays([]);
        setSelectedWeeks([]);
        setSelectedMonths([]);
        setSelectedYears([]);
        setIsOneTimeTask(false);
        setShowPopup(true);
    };
    const handleTaskComplete = async (category, index, isChecked) => {
        const task = tasks[category][index];
        if (!task._id) {
            // Special task (like monthly special)
            if (isChecked) {
                setTotalPoints(prev => prev + parseInt(task.points));
            } else {
                setTotalPoints(prev => prev - parseInt(task.points));
            }
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/habits/${task._id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: isChecked })
            });
            if (!res.ok) throw new Error('Failed to update task completion');
            if (isChecked) {
                setTotalPoints(prev => prev + parseInt(task.points));
            } else {
                setTotalPoints(prev => prev - parseInt(task.points));
            }
        } catch (err) {
            console.error('Error updating task completion:', err);
            setMessage('Error updating task completion');
        }
    };
    const toggleAllDays = () => {
        if (selectedDays.length === allDays.length) {
            setSelectedDays([]);
        } else {
            setSelectedDays([...allDays]);
        }
    };
    const toggleAllMonths = () => {
        if (selectedMonths.length === allMonths.length) {
            setSelectedMonths([]);
        } else {
            setSelectedMonths([...allMonths]);
        }
    };
    const handleSaveTask = async () => {
        if (!taskTitle || !taskPoints) {
            alert("Please fill in task name and points.");
            return;
        }
        let category = '';
        if (currentCategory === "Daily Tasks") category = 'daily';
        else if (currentCategory === "Weekly Tasks") category = 'weekly';
        else if (currentCategory === "Monthly Tasks") category = 'monthly';
        else if (currentCategory === "Yearly Tasks") category = 'yearly';
        let schedule = {};
        let isValid = true;
        if (isOneTimeTask) {
            schedule.isOneTime = true;
        } else {
            switch (category) {
                case "daily":
                    if (selectedDays.length === 0) {
                        isValid = false;
                        alert("Please select at least one day or choose 'Every Day'.");
                    } else {
                        schedule.days = selectedDays;
                    }
                    break;
                case "weekly":
                    if (selectedWeeks.length === 0) {
                        isValid = false;
                        alert("Please select at least one week or choose 'Every Week'.");
                    } else {
                        schedule.weeks = selectedWeeks;
                    }
                    break;
                case "monthly":
                    if (selectedMonths.length === 0) {
                        isValid = false;
                        alert("Please select at least one month or choose 'Every Month'.");
                    } else {
                        schedule.months = selectedMonths;
                    }
                    break;
                case "yearly":
                    if (selectedYears.length === 0) {
                        isValid = false;
                        alert("Please select at least one year or choose 'Every Year'.");
                    } else {
                        schedule.years = selectedYears;
                    }
                    break;
                default:
                    isValid = false;
                    break;
            }
        }
        if (!isValid) return;
        const newTask = {
            name: taskTitle,
            points: parseInt(taskPoints),
            category,
            isOneTime: isOneTimeTask,
            schedule
        };
        const token = localStorage.getItem("token");
        try {
            const res = await fetch('http://localhost:5000/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newTask),
            });
            if (!res.ok) throw new Error('Failed to create task');
            const data = await res.json();
            // Update frontend state with the new task
            const updatedTasks = { ...tasks };
            updatedTasks[currentCategory].push({
                name: data.name,
                points: data.points,
                _id: data._id
            });
            setTasks(updatedTasks);
            setMessage(`Task created: ${data.name}`);
            setShowPopup(false);
            setTaskTitle("");
            setTaskPoints("");
        } catch (err) {
            console.error('Error creating task:', err);
            setMessage('Error creating task');
        }
    };
    const addWeek = () => {
        if (newWeek && !selectedWeeks.includes(newWeek)) {
            setSelectedWeeks([...selectedWeeks, newWeek]);
            setNewWeek("");
        }
    };
    const addMonth = () => {
        if (newMonth && !selectedMonths.includes(newMonth)) {
            setSelectedMonths([...selectedMonths, newMonth]);
            setNewMonth("");
        }
    };
    const addYear = () => {
        if (newYear && !selectedYears.includes(newYear)) {
            setSelectedYears([...selectedYears, newYear]);
            setNewYear("");
        }
    };
    const selectEveryWeek = () => {
        setSelectedWeeks(["Every Week"]);
    };
    const selectEveryYear = () => {
        setSelectedYears(["Every Year"]);
    };
    const toggleOneTimeTask = () => {
        setIsOneTimeTask(!isOneTimeTask);
        if (!isOneTimeTask) {
            setSelectedDays([]);
            setSelectedWeeks([]);
            setSelectedMonths([]);
            setSelectedYears([]);
        }
    };
    const removeItem = (list, setList, item) => {
        setList(list.filter(i => i !== item));
    };
    return (
        <div className="task-container">
            <header>
                <div className="header-left">
                    <h1>{date}</h1>
                    <div className="points-display">Total Points: {totalPoints}</div>
                </div>
                <nav>
                    <button className="active">Tasks</button>
                    <Link to="/calendar" className="nav-button">Calendar</Link>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <Link to="/rewards" className="nav-button">Rewards</Link>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>
            {message && <p className="message">{message}</p>}
            <div className="task-grid">
                {Object.keys(tasks).map(category => (
                    <TaskBox
                        key={category}
                        title={category}
                        tasks={tasks[category]}
                        onAddTask={handleAddTask}
                        onTaskComplete={handleTaskComplete}
                    />
                ))}
            </div>
            {showPopup && (
                <div className="popup active">
                    <h3>Add New Task to {currentCategory}</h3>
                    <input
                        type="text"
                        placeholder="Task Name"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Points"
                        value={taskPoints}
                        onChange={(e) => setTaskPoints(e.target.value)}
                        min="1"
                    />
                    <div className="frequency-picker">
                        <h4>Task Frequency:</h4>
                        <div className="select-all-buttons">
                            <button
                                className={`select-all-btn ${isOneTimeTask ? 'active' : ''}`}
                                onClick={toggleOneTimeTask}
                            >
                                One-Time Task
                            </button>
                        </div>
                    </div>
                    {!isOneTimeTask && (
                        <>
                            {currentCategory === "Daily Tasks" && (
                                <div className="frequency-picker">
                                    <h4>Repeat on these days:</h4>
                                    <button
                                        className={`select-all-btn ${selectedDays.length ===
                                        allDays.length ? 'active' : ''}`}
                                        onClick={toggleAllDays}
                                    >
                                        {selectedDays.length === allDays.length ? 'Deselect All' : 'Every Day'}
                                            </button>
                                            <div className="days-grid">
                                        {allDays.map(day => (
                                            <label key={day}
                                        className={selectedDays.includes(day) ? "selected" : ""}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(day)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDays([...selectedDays, day]);
                                                } else {
                                                    setSelectedDays(selectedDays.filter(d =>
                                                        d !== day));
                                                }
                                            }}
                                            hidden
                                        />
                                        {day}
                                    </label>
                                    ))}
                                </div>
                                </div>
                                )}
                            {currentCategory === "Weekly Tasks" && (
                                <div className="frequency-picker">
                                    <h4>Repeat on these weeks:</h4>
                                    <div className="select-all-buttons">
                                        <button
                                            className={`select-all-btn ${selectedWeeks.includes("Every Week") ? 'active' : ''}`}
                                            onClick={selectEveryWeek}
                                        >
                                            Every Week
                                        </button>
                                    </div>
                                    <div className="input-with-button">
                                        <input
                                            type="week"
                                            value={newWeek}
                                            onChange={(e) => setNewWeek(e.target.value)}
                                        />
                                        <button onClick={addWeek}>Add Week</button>
                                    </div>
                                    <div className="selected-items">
                                        {selectedWeeks.map(week => (
                                            <span key={week} className="selected-item">{week === "Every Week" ? "Every Week" : week}
                                                <button onClick={() =>
                                                    removeItem(selectedWeeks, setSelectedWeeks, week)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentCategory === "Monthly Tasks" && (
                                <div className="frequency-picker">
                                    <h4>Repeat on these months:</h4>
                                    <button
                                        className={`select-all-btn ${selectedMonths.length
                                        === allMonths.length ? 'active' : ''}`}
                                        onClick={toggleAllMonths}
                                    >
                                        {selectedMonths.length === allMonths.length ?
                                            'Deselect All' : 'Every Month'}
                                    </button>
                                    <div className="input-with-button">
                                        <select
                                            value={newMonth}
                                            onChange={(e) => setNewMonth(e.target.value)}
                                        >
                                            <option value="">Select a month</option>
                                            {allMonths.map(month => (
                                                <option key={month} value={month}>{month}</
                                                    option>
                                            ))}
                                        </select>
                                        <button onClick={addMonth}>Add Month</button>
                                    </div>
                                    <div className="selected-items">
                                        {selectedMonths.map(month => (
                                            <span key={month} className="selected-item">{month}
                                                <button onClick={() =>
                                                    removeItem(selectedMonths, setSelectedMonths, month)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentCategory === "Yearly Tasks" && (
                                <div className="frequency-picker">
                                    <h4>Repeat on these years:</h4>
                                    <div className="select-all-buttons">
                                        <button
                                            className={`select-all-btn ${selectedYears.includes("Every Year") ? 'active' : ''}`}
                                            onClick={selectEveryYear}
                                        >
                                            Every Year
                                        </button>
                                    </div>
                                    <div className="input-with-button">
                                        <input
                                            type="number"
                                            min="2025"
                                            max="2100"
                                            value={newYear}
                                            onChange={(e) => setNewYear(e.target.value)}
                                            placeholder="Enter year"
                                        />
                                        <button onClick={addYear}>Add Year</button>
                                    </div>
                                    <div className="selected-items">
                                        {selectedYears.map(year => (
                                            <span key={year} className="selected-item">{year === "Every Year" ? "Every Year" : year}
                                                <button onClick={() => removeItem(selectedYears,
                                                    setSelectedYears, year)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="popup-buttons">
                        <button onClick={handleSaveTask}>Add Task</button>
                        <button onClick={() => setShowPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}