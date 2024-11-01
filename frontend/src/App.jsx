// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importing Pages
import UserSignup from './pages/User_signup.jsx';
import UserLogin from './pages/Login.jsx';
import Dashboard from './dashboard.jsx';

// Importing Layouts
import PublicLayout from './Layout/PublicLayout.jsx';
import UserLayout from './Layout/UserLayout.jsx';

const App = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes (Login and Signup) */}
                <Route path="/" element={<PublicLayout />}>
                    <Route path="signup" element={<UserSignup />} />
                    <Route path="login" element={<UserLogin />} />
                </Route>

                {/* User Routes (Dashboard) */}
                <Route path="/dashboard" element={<UserLayout />}>
                    <Route path="" element={<Dashboard VITE_BACKEND_URL={VITE_BACKEND_URL} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
