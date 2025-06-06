import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import '../styles/RewardsPage.css';

const RewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [newReward, setNewReward] = useState({ name: '', price: '', image: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/rewards', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setRewards(data);
            } catch (err) {
                console.error('❌ Failed to fetch rewards:', err);
            }
        };

        const fetchPoints = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/profile/points', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setPoints(data.points);
            } catch (err) {
                console.error('❌ Failed to fetch points:', err);
            }
        };

        fetchRewards();
        fetchPoints();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReward({ ...newReward, [name]: value });
    };

    const handleAddReward = async () => {
        if (!newReward.name || !newReward.price) return alert("Fill out all fields");

        try {
            const res = await fetch('http://localhost:5000/api/rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: newReward.name,
                    pointsRequired: parseInt(newReward.price)
                })
            });

            const data = await res.json();
            setRewards(prev => [...prev, data]);
            setNewReward({ name: '', price: '', image: '' });
            setShowAddForm(false);
        } catch (err) {
            console.error('❌ Error adding reward:', err);
        }
    };

    const handleDeleteReward = async (rewardId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await fetch(`http://localhost:5000/api/rewards/${rewardId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRewards(prev => prev.filter(r => r.reward_id !== rewardId));
        } catch (err) {
            console.error('❌ Error deleting reward:', err);
        }
    };

    const handlePurchase = async (rewardId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/rewards/redeem/${rewardId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            alert(data.message);

            setRewards(prev =>
                prev.map(r =>
                    r.reward_id === rewardId ? { ...r, purchased: true } : r
                )
            );

            setPoints(prev => prev - data.cost);
        } catch (err) {
            alert(err.message || 'Could not redeem reward.');
        }
    };

    return (
        <div className="rewards-container">
            <header>
                <div className="header-left">
                    <h1>Rewards</h1>
                    <div className="points-display">Your Points: {points}</div>
                </div>
                <nav>
                    <Link to="/taskpage" className="nav-button">Tasks</Link>
                    <Link to="/calendar" className="nav-button">Calendar</Link>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <button className="active">Rewards</button>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>

            <div className="rewards-content">
                <div className="rewards-header">
                    <h2>Available Rewards</h2>
                    <button
                        className="add-reward-btn"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Cancel' : '+ Add Reward'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="add-reward-form">
                        <h3>Add New Reward</h3>
                        <input
                            type="text"
                            name="name"
                            value={newReward.name}
                            onChange={handleInputChange}
                            placeholder="Reward Name"
                        />
                        <input
                            type="number"
                            name="price"
                            value={newReward.price}
                            onChange={handleInputChange}
                            placeholder="Points Cost"
                        />
                        <input
                            type="text"
                            name="image"
                            value={newReward.image}
                            onChange={handleInputChange}
                            placeholder="Image URL (optional)"
                        />
                        <button onClick={handleAddReward}>Save Reward</button>
                    </div>
                )}

                <div className="rewards-grid">
                    {rewards.map(reward => (
                        <div key={reward.reward_id} className={`reward-card ${reward.purchased ? 'purchased' : ''}`}>
                            <div className="reward-image">
                                <img src={reward.image || 'https://via.placeholder.com/150'} alt={reward.title} />
                                <button className="delete-reward-btn" onClick={() => handleDeleteReward(reward.reward_id)}>
                                    <FaTrash />
                                </button>
                            </div>
                            <div className="reward-info">
                                <h3>{reward.title}</h3>
                                <div className="reward-price">{reward.cost} points</div>
                                {reward.purchased ? (
                                    <div className="purchased-label">Purchased!</div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(reward.reward_id)}
                                        disabled={points < reward.cost}
                                    >
                                        Purchase
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardsPage;

