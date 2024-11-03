import React from "react";
import Navbar from "../Components/Navbar.jsx";
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
