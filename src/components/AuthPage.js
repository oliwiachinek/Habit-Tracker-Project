import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthPage.css"; // Importing the CSS file

const AuthCard = ({ title, bgColor, placeholder1, placeholder2, buttonText, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="auth-card"
            style={{
                backgroundColor: bgColor,
                transform: hovered ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.3s ease-in-out",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <h2 className="auth-title">{title}</h2>
            <input type="email" placeholder={placeholder1} className="auth-input" />
            <input type="password" placeholder={placeholder2} className="auth-input" />
            <button className="auth-button" onClick={onClick}>{buttonText}</button>
        </div>
    );
};

export default function AuthPage() {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-title-container">Welcome!</div>

            <div className="auth-forms">
                <AuthCard
                    title="Create an Account"
                    bgColor="rgba(243, 232, 255, 0.9)"
                    placeholder1="Your Email"
                    placeholder2="Create Password"
                    buttonText="Sign Up"
                />
                <AuthCard
                    title="Log In"
                    bgColor="rgba(252, 231, 243, 0.9)"
                    placeholder1="Email or Username"
                    placeholder2="Password"
                    buttonText="Log In"
                    onClick={() => navigate("/taskpage")}
                />
            </div>
        </div>
    );
}
