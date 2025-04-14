import { useState } from "react";

const AuthCard = ({ title, bgColor, placeholders, buttonText, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const [inputs, setInputs] = useState(Array(placeholders.length).fill(""));
    const [error, setError] = useState(null);

    const handleChange = (index, value) => {
        const updatedInputs = [...inputs];
        updatedInputs[index] = value;
        setInputs(updatedInputs);
    };

    const handleSubmit = async () => {
        setError(null);

        try {
            let data;
            let res;

            if (placeholders.length === 4) {
                const [firstName, lastName, email, password] = inputs;

                res = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstName, lastName, email, password}),
                });

                data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Registration failed");
                }
            } else if (placeholders.length === 2) {
                const [email, password] = inputs;

                res = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Login failed");
                }
            }
            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            onClick();
        } catch (err) {
            setError(err.message);
        }
    };

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
                <input
                    key={index}
                    type={placeholder.toLowerCase().includes("password") ? "password" : "text"}
                    placeholder={placeholder}
                    className="auth-input"
                    value={inputs[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                />
            ))}
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-button" onClick={handleSubmit}>
                {buttonText}
            </button>
        </div>
    );
};

export default AuthCard;
