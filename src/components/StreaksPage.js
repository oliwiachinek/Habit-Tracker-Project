import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import "../styles/StreaksPage.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StreaksPage = () => {
    const chartRef = useRef(null);
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const currentDay = currentDate.getDate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [friendEmail, setFriendEmail] = useState('');
    const [showAddFriendPopup, setShowAddFriendPopup] = useState(false);



    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchStreaks = async () => {
            try {
                const res = await fetch('/api/streaks', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setTasks(data); // Should now be an array with { id, name, completedDays }
            } catch (err) {
                console.error("Error fetching streaks:", err);
            }
        };

        fetchStreaks();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const response = await fetch(`http://localhost:5000/api/friends/leaderboard/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                } else {
                    alert('Failed to load leaderboard');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        };

        fetchLeaderboard();
    }, []);

    useEffect(() => {
        const chart = chartRef.current;
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, []);

    const handleAddFriend = () => {
        setShowAddFriendPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddFriendPopup(false);
        setFriendEmail('');
    };

    const handleSearchFriend = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId')

        try {
            const response = await fetch('http://localhost:5000/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterId: userId,
                    recipientEmail: friendEmail
                })
            });

            if (response.ok) {
                alert('Friend request sent!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }

        handleClosePopup();
    };


    const handleCompleteHabit = async (habitId) => {
        try {
            const res = await fetch(`/api/streaks/complete/${habitId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await res.json();
            alert(data.message);
        } catch (err) {
            console.error("Error completing habit:", err);
            alert("Failed to complete habit");
        }
    };


    const chartData = {
        labels: days.map(day => day.toString()),
        datasets: tasks.map(task => ({
            label: task.name,
            data: days.map(day =>
                Array.isArray(task.completedDays) && task.completedDays.includes(day)
                    ? tasks.indexOf(task) + 1
                    : null
            ),
            borderColor: task.color,
            backgroundColor: task.color,
            borderWidth: 2,
            pointRadius: days.map(day => day === currentDay ? 7 : 5),
            pointHoverRadius: 7,
            pointBackgroundColor: days.map(day => day === currentDay ? '#FFA500' : task.color),
            pointBorderColor: days.map(day => day === currentDay ? '#FFA500' : task.color),
            tension: 0.1,
            fill: false
        }))
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Days of the Month',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Tasks',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                min: 0,
                max: tasks.length + 1,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        if (value >= 1 && value <= tasks.length) {
                            return tasks[value - 1].name;
                        }
                        return '';
                    },
                    font: {
                        size: 12
                    }
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}`;
                    },
                    afterLabel: function(context) {
                        return `Day ${context.label}`;
                    },
                    title: function() {
                        return '';
                    }
                }
            }
        }
    };

    return (
        <div className="streaks-container">
            <header>
                <div className="header-left">
                    <h1>{currentMonth} {currentYear}</h1>
                </div>
                <nav>
                    <Link to="/taskpage" className="nav-button">Tasks</Link>
                    <Link to="/calendar" className="nav-button">Calendar</Link>
                    <button className="active">Streaks</button>
                    <Link to="/rewards" className="nav-button">Rewards</Link>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>

            <div className="streaks-content">
                <div className="chart-container">
                    <div className="chart-wrapper">
                        <Line
                            ref={chartRef}
                            data={chartData}
                            options={chartOptions}
                            key={JSON.stringify(chartData)}
                        />
                    </div>
                </div>

                <div className="habit-actions">
                    {tasks.map(task => (
                        <div key={task.habit_id} className="habit-row">
                            <span>{task.name}</span>
                            <button onClick={() => handleCompleteHabit(task.habit_id)}>Mark Complete</button>
                        </div>
                    ))}
                </div>

                <div className="leaderboard-container">
                    <h2>Friends Leaderboard</h2>
                    <div className="leaderboard-table">
                        <table>
                            <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Friend</th>
                                <th>Streak Points</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaderboard
                                .sort((a, b) => b.points - a.points)
                                .map((friend, index) => (
                                    <tr key={friend.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="friend-info">
                                                <div className="friend-avatar">{friend.avatar}</div>
                                                <div className="friend-name">{friend.full_name}</div>
                                            </div>
                                        </td>
                                        <td>{friend.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="add-friend-button" onClick={handleAddFriend}>
                            + Add Friend
                        </button>
                    </div>
                </div>
            </div>

            {showAddFriendPopup && (
                <div className="popup-overlay">
                    <div className="add-friend-popup">
                        <h3>Add Friend</h3>
                        <p>Search for your friend by their email address</p>
                        <form onSubmit={handleSearchFriend}>
                            <input
                                type="email"
                                placeholder="Enter friend's email"
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                                required
                            />
                            <div className="popup-buttons">
                                <button type="submit" className="search-button">
                                    Search
                                </button>
                                <button type="button" className="cancel-button" onClick={handleClosePopup}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreaksPage;
