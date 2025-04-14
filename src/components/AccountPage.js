import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiTrash2, FiLogOut, FiEdit, FiSave, FiX, FiUpload, FiCamera } from 'react-icons/fi';
import "../styles/AccountPage.css";

const AccountPage = () => {
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'email@example.com',
        joinDate: 'Joined January 2023',
        avatar: 'https://i.pinimg.com/originals/89/43/34/8943343904432420c1d4046c93110dfb.jpg'
    });

    const [editing, setEditing] = useState(false);
    const [tempUser, setTempUser] = useState({...user});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);

    const handleEdit = () => {
        setTempUser({...user});
        setEditing(true);
    };

    const handleSave = () => {
        setUser(tempUser);
        setEditing(false);
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

    const handleDeleteAccount = () => {
        // Add your account deletion logic here
        alert('Account deletion would happen here');
        setShowDeleteConfirm(false);
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
                                name="name"
                                value={tempUser.name}
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
                            <h2>{user.name}</h2>
                            <p className="user-email">{user.email}</p>
                        </>
                    )}

                    <p className="join-date">{user.joinDate}</p>

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
                        <Link to="/" className="logout-btn" >
                        <FiLogOut className="icon" />
                        Log Out</Link>

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