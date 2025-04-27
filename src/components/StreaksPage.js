import React, { useState, useRef, useEffect } from 'react';
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

// Register ChartJS components
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

    const [tasks] = useState([
        {
            id: 1,
            name: 'Wake up at 6',
            completedDays: [1, 2, 3, 4, 5, 8, 9, 10, 12, 15, 16, 18, 20, 22, 24],
            color: '#FF6384'
        },
        {
            id: 2,
            name: 'Skincare',
            completedDays: [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            color: '#36A2EB'
        },
        {
            id: 3,
            name: 'Journaling',
            completedDays: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23],
            color: '#FFCE56'
        },
        {
            id: 4,
            name: '10k steps',
            completedDays: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
            color: '#4BC0C0'
        }
    ]);

    useEffect(() => {
        const chart = chartRef.current;
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, []);

    const chartData = {
        labels: days.map(day => day.toString()),
        datasets: tasks.map(task => ({
            label: task.name,
            data: days.map(day => task.completedDays.includes(day) ? tasks.indexOf(task) + 1 : null),
            borderColor: task.color,
            backgroundColor: task.color,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.1,
            fill: false
        }))
    };

    // Fixed chart options
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
                        const label = context.dataset.label || '';
                        return `${label}: Day ${context.parsed.x}`;
                    }
                }
            }
        }
    };

    const calculateCurrentStreak = (completedDays) => {
        let streak = 0;
        const today = currentDate.getDate();

        for (let day = today; day >= 1; day--) {
            if (completedDays.includes(day)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const calculateLongestStreak = (completedDays) => {
        let longest = 0;
        let current = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            if (completedDays.includes(day)) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        }

        return longest;
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
                    <h2>Daily Task Completion</h2>
                    <div className="chart-wrapper">
                        <Line
                            ref={chartRef}
                            data={chartData}
                            options={chartOptions}
                            key={JSON.stringify(chartData)}
                        />
                    </div>
                </div>

                <div className="streaks-stats">
                    <h2>Task Statistics</h2>
                    <div className="stats-grid">
                        {tasks.map(task => (
                            <div key={task.id} className="stat-card" style={{ borderLeft: `5px solid ${task.color}` }}>
                                <h3>{task.name}</h3>
                                <div className="stat-values">
                                    <div>
                                        <span className="stat-label">Current Streak:</span>
                                        <span className="stat-value">{calculateCurrentStreak(task.completedDays)} days</span>
                                    </div>
                                    <div>
                                        <span className="stat-label">Longest Streak:</span>
                                        <span className="stat-value">{calculateLongestStreak(task.completedDays)} days</span>
                                    </div>
                                    <div>
                                        <span className="stat-label">Completion Rate:</span>
                                        <span className="stat-value">
                      {Math.round((task.completedDays.length / daysInMonth) * 100)}%
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreaksPage;