import React, { useState, useEffect } from 'react';
import '../styles/TaskPage.css';
import { Link } from 'react-router-dom';

const TaskBox = ({ title, tasks, onAddTask, onTaskComplete, onSpecialTaskComplete }) => {
    return (
        <div className="task-box">
            <h2>{title}</h2>
            <button className="add-btn" onClick={() => onAddTask(title)}>+</button>
            <ul>
                {tasks.map((task, index) => {
                    let isCompleted = false;
                    let isExpired = false;

                    if (task.special) {
                        isCompleted = task.status === 'completed';
                        isExpired = task.status === 'failed';
                    } else {
                        isCompleted =
                            task.category === 'daily' ? task.completedToday :
                                task.category === 'weekly' ? task.completedThisWeek :
                                    task.category === 'monthly' ? task.completedThisMonth :
                                        task.completedThisYear;
                    }

                    return (
                        <li key={index}>
                            {task.special && <span className="crown-icon">👑</span>}
                            <span className={task.special ? "special-task" : ""}>{task.name}</span>
                            <span className="points">{task.points}p</span>
                            {task.special && isExpired ? (
                                <span className="expired-icon">❌</span>
                            ) : (
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    disabled={isCompleted || isExpired}
                                    onChange={(e) => {
                                        if (task.special) {
                                            onSpecialTaskComplete(task.task_id, e.target.checked);
                                        } else {
                                            onTaskComplete(task.habit_id, title, e.target.checked);
                                        }
                                    }}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );




};

export default function TaskPage() {
    const [date, setDate] = useState(new Date().toLocaleDateString());
    const [showPopup, setShowPopup] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskPoints, setTaskPoints] = useState('');
    const [tasks, setTasks] = useState({
        "Daily Tasks": [],
        "Weekly Tasks": [],
        "Monthly Tasks": [],
        "Yearly Tasks": []
    });
    const [currentCategory, setCurrentCategory] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedWeeks, setSelectedWeeks] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [newWeek, setNewWeek] = useState('');
    const [newMonth, setNewMonth] = useState('');
    const [newYear, setNewYear] = useState('');
    const [isOneTimeTask, setIsOneTimeTask] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    const [message, setMessage] = useState('');
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('en-US', { month: 'long' })
    );

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            try {
                const res = await fetch('http://localhost:5000/api/habits', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch tasks');
                const data = await res.json();
                console.log("Raw tasks from backend:", data);

                const [
                    todayRes,
                    weekRes,
                    monthRes,
                    yearRes
                ] = await Promise.all([
                    fetch('http://localhost:5000/api/habits/completions/today', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/habits/completions/week', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/habits/completions/month', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/habits/completions/year', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                if (!todayRes.ok || !weekRes.ok || !monthRes.ok || !yearRes.ok) {
                    throw new Error('Failed to fetch completions');
                }
                const todayData = await todayRes.json();
                const weekData = await weekRes.json();
                const monthData = await monthRes.json();
                const yearData = await yearRes.json();

                const completedTodayIds = todayData.completedToday || [];
                const completedThisWeekIds = weekData.map(item => item.habit_id);
                const completedThisMonthIds = monthData.map(item => item.habit_id);
                const completedThisYearIds = yearData.map(item => item.habit_id);

                const transformedTasks = {
                    "Daily Tasks": [],
                    "Weekly Tasks": [],
                    "Monthly Tasks": [],
                    "Yearly Tasks": []
                };
                data.forEach(task => {
                    const taskObj = {
                        name: task.name,
                        points: task.points,
                        habit_id: task.habit_id,
                        category: task.category,
                        completedToday: completedTodayIds.includes(task.habit_id),
                        completedThisWeek: completedThisWeekIds.includes(task.habit_id),
                        completedThisMonth: completedThisMonthIds.includes(task.habit_id),
                        completedThisYear: completedThisYearIds.includes(task.habit_id)                    };
                    console.log(`Categorizing task "${task.name}" with ID ${task.habit_id} and category "${task.category}"`);

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

                const specialRes = await fetch(`http://localhost:5000/api/special-tasks/random/${userId}`, {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}` }
                });
                if (specialRes.ok) {
                    const specialTask = await specialRes.json();
                    console.log("Special task fetched:", specialTask);
                    transformedTasks["Monthly Tasks"].push({
                        name: specialTask.title,
                        points: specialTask.points_reward,
                        task_id: specialTask.task_id,
                        category: 'monthly',
                        special: true,
                        status: specialTask.status
                    });
                } else {
                    console.log('No special task found or already expired/completed.');
                }


                console.log("Transformed task structure:", transformedTasks);
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

    useEffect(() => {
        const fetchUserPoints = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch('http://localhost:5000/api/profile/points', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user points');
                }

                const data = await response.json();
                setTotalPoints(data.points);
            } catch (error) {
                console.error('Error fetching user points', error);
            }
        };

        fetchUserPoints();
    }, []);

    useEffect(() => {
        const savedTasks = localStorage.getItem('tasks');

        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    const handleTaskComplete = async (habitId, category) => {
        const token = localStorage.getItem("token");

        console.log("Habit ID used:", habitId);

        const today = new Date().toISOString().split('T')[0];
        console.log("Logging for date:", today);

        try {
            const res = await fetch(`http://localhost:5000/api/habits/${habitId}/entries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ date: today }),
            });

            console.log("Backend response status:", res.status);

            if (!res.ok) throw new Error("Failed to log completion to backend");

            setTasks((prevTasks) => {
                const updatedCategoryTasks = prevTasks[category].map(task => {
                    if (task.habitId === habitId) {
                        return {
                            ...task,
                            completedDays: task.completedDays.includes(today)
                                ? task.completedDays
                                : [...task.completedDays, today],
                        };
                    }
                    return task;
                });

                return {
                    ...prevTasks,
                    [category]: updatedCategoryTasks,
                };
            });

            setMessage(`Completed task :D !!`);
        } catch (err) {
            console.error("Error updating task completion:", err);
            setMessage("Error completing task");
        }
    };

    const handleSpecialTaskComplete = async (task_id) => {
        const token = localStorage.getItem("token");
        console.log("Sending PATCH request for special task:", { task_id });

        try {
            const res = await fetch(`http://localhost:5000/api/special-tasks/${task_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "completed" }),
            });

            console.log("Response status:", res.status);
            const resData = await res.json();
            console.log("Response data:", resData);

            if (!res.ok) throw new Error(resData.error || "Failed to update special task status");

            setTasks((prevTasks) => {
                const updatedMonthlyTasks = prevTasks["Monthly Tasks"].map(task => {
                    if (task.task_id === task_id) {
                        return {
                            ...task,
                            status: "completed",
                        };
                    }
                    return task;
                });

                return {
                    ...prevTasks,
                    "Monthly Tasks": updatedMonthlyTasks,
                };
            });

            setMessage("Special task completed!");
        } catch (err) {
            console.error("Error updating special task status:", err);
            setMessage(err.message || "Error updating special task");
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
            one_time: isOneTimeTask,
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
            console.log("Created task data:", data);


            const updatedTasks = {
                habitId: data.habitId,
                name: data.name,
                points: data.points,
                completedDays: []
            };

            setTasks((prev) => ({
                ...prev,
                [currentCategory]: [...prev[currentCategory], updatedTasks],
            }));

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
                    <div className="points-display">Total Points: {totalPoints} </div>
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
                        onSpecialTaskComplete={handleSpecialTaskComplete}
                        category={category}
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