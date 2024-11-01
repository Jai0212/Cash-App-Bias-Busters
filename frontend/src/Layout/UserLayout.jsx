import UserNavbar from "../Components/UserNavbar.jsx"; // Import the UserNavbar
import { Outlet, useNavigate } from "react-router-dom"; // Import Outlet and useNavigate
import { useEffect, useState } from "react"; // Import necessary hooks

const UserLayout = () => {
    const [verified, setVerified] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        let token = localStorage.getItem("token"); // Get token from localStorage

        if (!token) {
            navigate("/"); 
        } else {
            setVerified(true); // Set verified state if token exists
        }
    }, [navigate]);

    return (
        <>
            {verified && (
                <>
                    <UserNavbar /> {/* Render the User Navbar */}
                    <Outlet /> {/* Render child routes */}
                </>
            )}
        </>
    );
};

export default UserLayout;
