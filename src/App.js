import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import TaskPage from "./components/TaskPage";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/taskpage" element={<TaskPage />} />
        </Routes>
      </Router>
  );
}

export default App;
