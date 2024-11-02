// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importing Pages
import UserSignup from './pages/User_signup.jsx';
import UserLogin from './pages/Login.jsx';
import Dashboard from './dashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

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
                    <Route path="forgot_password" element={<ForgotPassword />} />
                    <Route path="reset_password" element={<ResetPassword />} />
                </Route>

                {/* User Routes (Dashboard) */}
                <Route path="/dashboard" element={<UserLayout />}>
                    <Route path="" element={<Dashboard VITE_BACKEND_URL={VITE_BACKEND_URL} />} />
                    <Route path="change-password" element={<ChangePassword />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
