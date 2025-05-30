import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiTrash2, FiLogOut, FiEdit, FiSave, FiX, FiUpload, FiCamera } from 'react-icons/fi';
import "../styles/AccountPage.css";

const AccountPage = () => {
    const [user, setUser] = useState({
        full_name: '',
        email: '',
        join_date: '',
        avatar: ''
    });
    const [editing, setEditing] = useState(false);
    const [tempUser, setTempUser] = useState({...user});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.join_date) {
                    const formattedDate = new Date(data.join_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    data.join_date = formattedDate;
                }
                setUser(data);
                setTempUser(data);
            }
        };
        fetchUserData();
    }, []);

    const handleEdit = () => {
        setTempUser({...user});
        setEditing(true);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/${user.user_id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(tempUser)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setEditing(false);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCancel = () => {
        setEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempUser({...tempUser, [name]: value});
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempUser({...tempUser, avatar: reader.result});
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                alert('Account deleted successfully');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="simple-account-container">
            <header>
                <div className="header-left">
                    <h1>Account</h1>
                </div>
                <nav>
                    <Link to="/taskpage" className="nav-button">Tasks</Link>
                    <Link to="/calendar" className="nav-button">Calendar</Link>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <Link to="/rewards" className="nav-button">Rewards</Link>
                    <button className="active">Account</button>
                </nav>
            </header>

            <div className="simple-account-content">
                <div className="user-profile">
                    <div className="avatar-container">
                        <img
                            src={editing ? tempUser.avatar : user.avatar}
                            alt={user.name}
                            className="user-avatar"
                        />
                        {editing && (
                            <>
                                <button className="upload-btn" onClick={triggerFileInput}>
                                    <FiCamera className="icon" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </>
                        )}
                    </div>

                    {editing ? (
                        <div className="edit-fields">
                            <input
                                type="text"
                                name="full_name"
                                value={tempUser.full_name}
                                onChange={handleChange}
                                className="edit-input"
                            />
                            <input
                                type="email"
                                name="email"
                                value={tempUser.email}
                                onChange={handleChange}
                                className="edit-input"
                            />
                        </div>
                    ) : (
                        <>
                            <h2>{user.full_name}</h2>
                            <p className="user-email">{user.email}</p>
                        </>
                    )}

                    <p className="join-date">Member since {user.join_date}</p>

                    <div className="edit-actions">
                        {editing ? (
                            <>
                                <button onClick={handleSave} className="save-btn">
                                    <FiSave className="icon" />
                                    Save
                                </button>
                                <button onClick={handleCancel} className="cancel-btn">
                                    <FiX className="icon" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEdit} className="edit-btn">
                                <FiEdit className="icon" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="account-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut className="icon" />
                        Log Out
                    </button>

                    <button
                        className="delete-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <FiTrash2 className="icon" />
                        Delete Account
                    </button>
                </div>

                {showDeleteConfirm && (
                    <div className="delete-confirm-modal">
                        <div className="modal-content">
                            <h3>Delete Your Account?</h3>
                            <p>This will permanently remove all your data. This action cannot be undone.</p>
                            <div className="modal-buttons">
                                <button
                                    className="confirm-delete-btn"
                                    onClick={handleDeleteAccount}
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    className="cancel-delete-btn"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
