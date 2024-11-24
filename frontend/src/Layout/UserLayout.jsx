import React from "react";
import UserNavbar from "../Components/UserNavbar/UserNavbar.jsx"; // Import the UserNavbar
import Footer from "../Components/Footer/Footer.jsx"; // Import the Footer component
import { Outlet } from "react-router-dom"; // Import Outlet

const UserLayout = () => {
    return (
        <>
            <UserNavbar /> {/* Render the User Navbar */}
            <Outlet /> {/* Render child routes */}
            <Footer /> {/* Render the Footer */}
        </>
    );
};

export default UserLayout;
