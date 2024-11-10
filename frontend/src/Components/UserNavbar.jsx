import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./UserNavbar.css";

function UserNavbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/change-password">
                  Change Password
                </Link>
              </li>
            </ul>
            <button
              className="btn btn-outline-danger ms-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default UserNavbar;
