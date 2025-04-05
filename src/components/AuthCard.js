import {useState} from "react";

const AuthCard = ({ title, bgColor, placeholders, buttonText, onClick }) => {
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
            {placeholders.map((placeholder, index) => (
                <input key={index} type="text" placeholder={placeholder} className="auth-input" />
            ))}
            <button className="auth-button" onClick={onClick}>{buttonText}</button>
        </div>
    );
};

export default AuthCard;