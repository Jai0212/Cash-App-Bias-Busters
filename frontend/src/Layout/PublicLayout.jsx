import React from "react";
import Navbar from "../Components/Navbar/Navbar.jsx";
import Footer from "../Components/Footer/Footer.jsx"; // Import Footer
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
    return (
        <>
            <Navbar /> {/* Render the Navbar */}
            <Outlet /> {/* Render child routes here */}
        </>
    );
};

export default PublicLayout;
