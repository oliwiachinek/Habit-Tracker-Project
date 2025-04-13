import React, { useEffect, useState } from 'react';
import "../styles/TaskPage.css";
import { Link } from 'react-router-dom';

const TaskBox = ({ title, tasks, onAddTask, onTaskComplete }) => {
    return (
        <div className="task-box">
            <h2>{title}</h2>
            <button className="add-btn" onClick={() => onAddTask(title)}>+</button>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task.special && <span className="crown-icon">👑</span>}
                        <span className={task.special ? "special-task" : ""}>
                            {task.name}
                        </span>
                        <span className="points">{task.points}p</span>
                        <input
                            type="checkbox"
                            onChange={(e) => onTaskComplete(title, index, e.target.checked)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TaskPage = ({ userId }) => {
    const [specialTask, setSpecialTask] = useState(null);
    const [specialError, setSpecialError] = useState('');
    const [specialStatusMsg, setSpecialStatusMsg] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString());
    const [showPopup, setShowPopup] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskPoints, setTaskPoints] = useState("");
    const [tasks, setTasks] = useState({
        "Daily Tasks": [],
        "Weekly Tasks": [],
        "Monthly Tasks": [],
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

    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('en-US', { month: 'long' })
    );

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/habits', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch tasks');
                const data = await res.json();

                const grouped = {
                    "Daily Tasks": [],
                    "Weekly Tasks": [],
                    "Monthly Tasks": [],
                    "Yearly Tasks": []
                };

                data.forEach(task => {
                    switch (task.category) {
                        case 'daily':
                            grouped["Daily Tasks"].push(task);
                            break;
                        case 'weekly':
                            grouped["Weekly Tasks"].push(task);
                            break;
                        case 'monthly':
                            grouped["Monthly Tasks"].push(task);
                            break;
                        case 'yearly':
                            grouped["Yearly Tasks"].push(task);
                            break;
                        default:
                            break;
                    }
                });

                setTasks(grouped);

            } catch (error) {
                console.error(error);
            }
        };

        fetchTasks();
    }, []);


    useEffect(() => {
        const fetchSpecialTask = async () => {
            try {
                const res = await fetch(`http://localhost:5000/specialTasks/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!res.ok) throw new Error('No special task available');
                const data = await res.json();
                setSpecialTask(data);
            } catch (err) {
                console.warn(err.message);
                setSpecialError('No special task available right now.');
            }
        };

        fetchSpecialTask();
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

    const handleTaskComplete = async (category, taskIndex, isChecked) => {
        const allTasks = Object.values(tasks).flat();
        if (specialTask) allTasks.push(specialTask);

        const task = allTasks[taskIndex];
        const delta = isChecked ? parseInt(task.points) : -parseInt(task.points);

        try {
            const token = localStorage.getItem('token');

            if (task.special) {
                const res = await fetch(`http://localhost:5000/specialTasks/${task.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization' : `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: isChecked ? 'completed' : 'pending' }),
                });

                if (!res.ok) throw new Error('Failed to update special task status');

                const updated = await res.json();
                setSpecialTask(prev => ({ ...prev, status: updated.status }));
            } else {
                const updatedCategoryTasks = [...tasks[category]];
                updatedCategoryTasks[taskIndex] = {
                    ...updatedCategoryTasks[taskIndex],
                    completed: isChecked
                };
                setTasks(prev => ({
                    ...prev,
                    [category]: updatedCategoryTasks
                }));
            }

            const pointsRes = await fetch(`http://localhost:5000/api/users/${userId}/points`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json',
                'Authorization' : `Bearer ${token}`,},
                body: JSON.stringify({ delta }),
            });

            if (!pointsRes.ok) throw new Error('Failed to update user points');

            setTotalPoints(prev => prev + delta);

        } catch (err) {
            console.error('Task completion failed:', err);
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

        let schedule = {};
        let isValid = true;

        if (isOneTimeTask) {
            schedule.isOneTime = true;
        } else {
            switch (currentCategory) {
                case "Daily Tasks":
                    if (selectedDays.length === 0) {
                        isValid = false;
                        alert("Please select at least one day or choose 'Every Day'.");
                    } else {
                        schedule.days = selectedDays;
                    }
                    break;
                case "Weekly Tasks":
                    if (selectedWeeks.length === 0) {
                        isValid = false;
                        alert("Please select at least one week or choose 'Every Week'.");
                    } else {
                        schedule.weeks = selectedWeeks;
                    }
                    break;
                case "Monthly Tasks":
                    if (selectedMonths.length === 0) {
                        isValid = false;
                        alert("Please select at least one month or choose 'Every Month'.");
                    } else {
                        schedule.months = selectedMonths;
                    }
                    break;
                case "Yearly Tasks":
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
            title: taskTitle,
            points: parseInt(taskPoints),
            expires_at: isOneTimeTask ? new Date().toISOString() : null,
            user_id: userId,
            category: currentCategory.toLowerCase().replace(" tasks", ""),
            schedule: schedule,

    };
        try {

            const response = await fetch('http://localhost:5000/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                throw new Error('Failed to save task');
            }

            const savedTask = await response.json();

            setTasks(prevTasks => ({
                ...prevTasks,
                [currentCategory]: [...prevTasks[currentCategory], savedTask]
        }));

        setShowPopup(false);
        setTaskTitle("");
        setTaskPoints("");
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task. Please try again.");
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
                    <input type="text" placeholder="Task Name"
                           value={taskTitle}
                           onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <input type="number" placeholder="Points"
                           value={taskPoints}
                           onChange={(e) => setTaskPoints(e.target.value)}
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
                                        className={`select-all-btn ${selectedDays.length === allDays.length ? 'active' : ''}`}
                                        onClick={toggleAllDays}
                                    >
                                        {selectedDays.length === allDays.length ? 'Deselect All' : 'Every Day'}
                                    </button>
                                    <div className="days-grid">
                                        {allDays.map(day => (
                                            <label key={day} className={selectedDays.includes(day) ? "selected" : ""}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDays.includes(day)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDays([...selectedDays, day]);
                                                        } else {
                                                            setSelectedDays(selectedDays.filter(d => d !== day));
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
                                            <span key={week} className="selected-item">
                                                {week === "Every Week" ? "Every Week" : week}
                                                <button onClick={() => removeItem(selectedWeeks, setSelectedWeeks, week)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentCategory === "Monthly Tasks" && (
                                <div className="frequency-picker">
                                    <h4>Repeat on these months:</h4>
                                    <button
                                        className={`select-all-btn ${selectedMonths.length === allMonths.length ? 'active' : ''}`}
                                        onClick={toggleAllMonths}
                                    >
                                        {selectedMonths.length === allMonths.length ? 'Deselect All' : 'Every Month'}
                                    </button>
                                    <div className="input-with-button">
                                        <select
                                            value={newMonth}
                                            onChange={(e) => setNewMonth(e.target.value)}
                                        >
                                            <option value="">Select a month</option>
                                            {allMonths.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <button onClick={addMonth}>Add Month</button>
                                    </div>
                                    <div className="selected-items">
                                        {selectedMonths.map(month => (
                                            <span key={month} className="selected-item">
                                                {month}
                                                <button onClick={() => removeItem(selectedMonths, setSelectedMonths, month)}>×</button>
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
                                            <span key={year} className="selected-item">
                                                {year === "Every Year" ? "Every Year" : year}
                                                <button onClick={() => removeItem(selectedYears, setSelectedYears, year)}>×</button>
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
};


export default TaskPage;
