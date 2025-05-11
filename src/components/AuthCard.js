import { useState, useEffect } from "react";
import '../styles/AuthCard.css';

const AuthCard = ({ title, bgColor, placeholders, buttonText, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const [inputs, setInputs] = useState(Array(placeholders.length).fill(""));
    const [errors, setErrors] = useState(Array(placeholders.length).fill(""));
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasNumbersAndLetters: false,
        hasSpecialChar: false,
    });
    const [isPasswordTyping, setIsPasswordTyping] = useState(false);

    useEffect(() => {
        setIsSubmitDisabled(!validateInputs(inputs) || (placeholders.length === 4 && !isPasswordValid()));
    }, [inputs, passwordValidations]);

    const handleChange = (index, value) => {
        const updatedInputs = [...inputs];
        updatedInputs[index] = value;
        setInputs(updatedInputs);

        const updatedErrors = [...errors];
        updatedErrors[index] = "";
        setErrors(updatedErrors);

        validateInputs(updatedInputs);

        if (index === placeholders.length - 1) {
            setIsPasswordTyping(value.length > 0);
            updatePasswordValidation(value);
        }
    };

    const updatePasswordValidation = (password) => {
        setPasswordValidations({
            minLength: password.length >= 6,
            hasNumbersAndLetters: /[a-zA-Z]/.test(password) && /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const isPasswordValid = () => {
        const { minLength, hasNumbersAndLetters, hasSpecialChar } = passwordValidations;
        return minLength && hasNumbersAndLetters && hasSpecialChar;
    };

    const validateInputs = (updatedInputs) => {
        let valid = true;
        const updatedErrors = [...errors];
        const [firstName, lastName, email, password] = updatedInputs;

        updatedErrors.fill("");

        if (placeholders.length === 4) {
            if (!firstName || !lastName) {
                updatedErrors[0] = "Please enter your first and last name.";
                valid = false;
            } else if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                updatedErrors[2] = "Please enter a valid email.";
                valid = false;
            } else if (!password) {
                updatedErrors[3] = "Please enter a password.";
                valid = false;
            } else if (!isPasswordValid()) {
                updatedErrors[3] = "Password does not meet the required criteria.";
                valid = false;
            }
        } else if (placeholders.length === 2) {
            const [email, password] = updatedInputs;
            if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                updatedErrors[0] = "Please enter a valid email.";
                valid = false;
            } else if (!password) {
                updatedErrors[1] = "Please enter your password.";
                valid = false;
            }
        }

        setErrors(updatedErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateInputs(inputs)) return;

        try {
            let data;
            let res;

            if (placeholders.length === 4) {
                const [firstName, lastName, email, password] = inputs;

                res = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstName, lastName, email, password }),
                });

                data = await res.json();

                if (!res.ok) {
                    if (data.error && data.error.includes("users_email_key")) {
                        throw new Error("Email connected to an existing account.");
                    } else {
                        throw new Error(data.message || "Registration failed");
                    }
                }

                res = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Login failed");
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
                    if (data.message === "Invalid email") {
                        throw new Error("Email not connected to an account.");
                    } else if (data.message === "Incorrect password") {
                        throw new Error("Incorrect password.");
                    } else {
                        throw new Error(data.message || "Login failed");
                    }
                }
            }

            if (data?.token) {
                localStorage.setItem("token", data.token);
                const payloadBase64 = data.token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                const userId = decodedPayload.id;
                localStorage.setItem("userId", userId);
            }

            onClick();

        } catch (err) {
            setErrors([err.message]);
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
                <div key={index} className="auth-input-container">
                    <input
                        type={placeholder.toLowerCase().includes("password") ? "password" : "text"}
                        placeholder={placeholder}
                        className="auth-input"
                        value={inputs[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                </div>
            ))}

            {placeholders.length === 4 && isPasswordTyping && (
                <div className="password-requirements">
                    <ul>
                        <li className={passwordValidations.minLength ? "valid" : "invalid"}>
                            Must be at least 6 characters
                        </li>
                        <li className={passwordValidations.hasNumbersAndLetters ? "valid" : "invalid"}>
                            Must include numbers and letters
                        </li>
                        <li className={passwordValidations.hasSpecialChar ? "valid" : "invalid"}>
                            Must include a special character
                        </li>
                    </ul>
                </div>
            )}

            <div className="auth-errors">
                {errors.map((error, index) => error && <p key={index} className="auth-error">{error}</p>)}
            </div>

            <button
                className="auth-button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default AuthCard;
