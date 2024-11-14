import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";  // You will need to install axios for making API requests
import "./UserNavbar.css";

function UserNavbar() {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/logout`);

      if (response.data.error === false) {
        navigate("/");
      } else {
        console.error("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
      <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <div>
              <img
                  className="cash-logo"
                  src="src/assets/cash-app-logo.png"
                  alt="CashApp's logo in green"
              />
            </div>
            <div
                className="menu-container collapse navbar-collapse"
                id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                  <Link className="nav-link" to="/about">
                    About Us
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/model-tester">
                    Model Tester
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/change-password">
                    Change Password
                  </Link>
                </li>
              </ul>
              <div className="btn-container">
                <button
                    className="logout-btn btn btn-outline-danger ms-2"
                    onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      </>
  );
}

export default UserNavbar;
