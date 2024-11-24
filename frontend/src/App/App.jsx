import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing Pages
import UserSignup from "../pages/UserSignup/UserSignup.jsx";
import UserLogin from "../pages/UserLogin/UserLogin.jsx";
import Dashboard from "../pages/DashboardPage/Dashboard/Dashboard.jsx";
import Dashboard2 from "../pages/ModelTester/Dashboard2/Dashboard2.jsx";
import ChangePassword from "../pages/ChangePassword/ChangePassword.jsx";
import AboutPage from "../pages/AboutPage/AboutPage.jsx";
import QRCodeShare from "../pages/DashboardPage/QRCodeShare/QRCodeShare.jsx";
import SharePage from "../pages/SharePage/SharePage.jsx";

// Importing Layouts
import PublicLayout from "../Layout/PublicLayout.jsx";
import UserLayout from "../Layout/UserLayout.jsx";

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
        <Route path="/model-tester" element={<UserLayout />}>
          <Route path="" element={<Dashboard2 />} />
        </Route>
        <Route path="/change-password" element={<UserLayout />}>
          <Route path="" element={<ChangePassword />} />
        </Route>
        <Route path="/about" element={<UserLayout />}>
          <Route path="" element={<AboutPage />} />
        </Route>
        <Route path="/share/:encodedData" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
