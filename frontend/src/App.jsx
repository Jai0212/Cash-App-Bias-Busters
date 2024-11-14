import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing Pages
import UserSignup from "./pages/Signup.jsx";
import UserLogin from "./pages/Login.jsx";
import Dashboard from "./dashboard.jsx";
import Dashboard2 from "./dashboard2.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import About from "./pages/About.jsx";

// Importing Layouts
import PublicLayout from "./Layout/PublicLayout.jsx";
import UserLayout from "./Layout/UserLayout.jsx";

const App = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Login and Signup) */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<UserLogin />} /> {/* Default path renders UserLogin */}
          <Route path="signup" element={<UserSignup />} />
        </Route>

        {/* User Routes (Dashboard) */}
        <Route path="/dashboard" element={<UserLayout />}>
          <Route
            path=""
            element={<Dashboard VITE_BACKEND_URL={VITE_BACKEND_URL} />}
          />
        </Route>
        <Route path="/dashboard2" element={<UserLayout />}>
          <Route path="" element={<Dashboard2 />} />
        </Route>
        <Route path="/change-password" element={<UserLayout />}>
          <Route path="" element={<ChangePassword />} />
        </Route>
        <Route path="/about" element={<UserLayout />}>
          <Route path="" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
