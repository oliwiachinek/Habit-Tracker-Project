import { useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import "../styles/AuthPage.css";

const RegisterPage = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-title-container">Create Account</div>

            <div className="auth-forms">
                <AuthCard
                    title="Sign Up"
                    bgColor="rgba(243, 232, 255, 0.9)"
                    placeholders={["First Name", "Last Name", "Email", "Password"]}
                    buttonText="Create Account"
                    onClick={() => navigate("/taskpage")}
                />
            </div>

            <div className="auth-register-prompt">
                <p>Already have an account?</p>
                <button onClick={() => navigate("/")}>Log In here</button>
            </div>
        </div>
    );
};

export default RegisterPage;