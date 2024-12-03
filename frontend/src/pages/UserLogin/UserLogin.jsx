import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import axios from "axios";
import { envConfig } from "../../envConfig";

const UserLogin = () => {
  const navigate = useNavigate();
  const VITE_BACKEND_URL = envConfig();

  useEffect(() => {
    const uploadedFiles = localStorage.getItem("uploadedFiles");

    if (uploadedFiles && uploadedFiles.length > 0) {
      handleLogout();
    }

    localStorage.removeItem("uploadedFiles");
  }, []);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleForm = (data) => {
    console.log(data);

    const url = `${VITE_BACKEND_URL}/login`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.data);
        if (res.error === true) {
          swal.fire({
            icon: "error",
            title: res.message,
          });
        } else {
          document.getElementById("form").reset();
          swal
            .fire({
              icon: "success",
              title: res.message,
              timer: 1500,
            })
            .then(() => {
              console.log("Login successful");
              navigate("/dashboard");
            });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="main-container">
      <div className="container-login">
        <h1>User Login</h1>
      </div>

      <hr className="seperator" />
      <div className="alert alert-primary">
        <form onSubmit={handleSubmit(handleForm)} id={"form"}>
          <div className="mb-3">
            <label htmlFor="email">Email</label>
            <input
              {...register("email", { required: "This field is required" })}
              type="email"
              className={"form-control"}
              id="email"
            />
            <ErrorMessage
              errors={errors}
              name="email"
              render={({ message }) => (
                <p className={"text-danger"}>{message}</p>
              )}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">Password</label>
            <input
              {...register("password", { required: "This field is required" })}
              type="password"
              className={"form-control"}
              id="password"
            />
            <ErrorMessage
              errors={errors}
              name="password"
              render={({ message }) => (
                <p className={"text-danger"}>{message}</p>
              )}
            />
          </div>

          <button
            className={"btn btn-primary"}
            aria-label="Login"
            data-testid="login-button"
          >
            Login
          </button>
        </form>
      </div>
      <div className="img-container">
        <img src="/bottom-login.gif" className="login-signup-gif" />
      </div>
    </div>
  );
};

export default UserLogin;
