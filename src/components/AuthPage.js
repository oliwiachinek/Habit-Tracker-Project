import { useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import "../styles/AuthPage.css";

const AuthPage = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-title-container">Welcome!</div>

            <div className="auth-forms">
                <AuthCard
                    title="Log In"
                    bgColor="rgba(252, 231, 243, 0.9)"
                    placeholders={["Email", "Password"]}
                    buttonText="Log In"
                    onClick={() => navigate("/taskpage")}
                />
            </div>

            <div className="auth-register-prompt">
                <p>Is it your first time?</p>
                <button onClick={() => navigate("/register")}>Register here</button>
            </div>
        </div>
    );
};

export default AuthPage;