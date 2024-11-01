// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import UserSignup from './pages/User_signup.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './dashboard.jsx';

const App = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

    return (
        <Router>
            <Routes>
                {/* Main Route for Login */}
                <Route path="/" element={<Login />} />

                {/* Signup Route */}
                <Route path="/signup" element={<UserSignup />} />

                {/* Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={<Dashboard VITE_BACKEND_URL={VITE_BACKEND_URL} />} 
                />
            </Routes>
        </Router>
    );
};

export default App;
