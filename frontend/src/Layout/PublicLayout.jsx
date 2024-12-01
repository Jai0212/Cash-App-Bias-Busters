import React from "react";
import Navbar from "../Components/Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
    return (
        <>
            <Navbar /> {/* Render the Navbar */}
            <Outlet data-testid="outlet" /> {/* Add data-testid for testing */}
        </>
    );
};

export default PublicLayout;
