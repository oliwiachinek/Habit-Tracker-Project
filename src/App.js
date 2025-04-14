import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import RegisterPage from './components/RegisterPage';
import TaskPage from './components/TaskPage';
import CalendarPage from './components/CalendarPage';
import StreaksPage from "./components/StreaksPage";
import RewardsPage from "./components/RewardsPage";
import AccountPage from "./components/AccountPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/taskpage" element={<TaskPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/streaks" element={<StreaksPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/account" element={<AccountPage />} />
            </Routes>
        </Router>
    );
}

export default App;