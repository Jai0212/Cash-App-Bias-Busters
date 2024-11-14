import UserNavbar from "../Components/UserNavbar/UserNavbar.jsx"; // Import the UserNavbar
import { Outlet } from "react-router-dom"; // Import Outlet

const UserLayout = () => {
    return (
        <>
            <UserNavbar /> {/* Render the User Navbar */}
            <Outlet /> {/* Render child routes */}
        </>
    );
};

export default UserLayout;