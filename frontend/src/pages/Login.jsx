import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../pages/Login.css";

const UserLogin = () => {
  const navigate = useNavigate();
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState(""); // Initialize currUser as an empty string
  const [isLoading, setIsLoading] = useState(true); // Loading state for user data

  const fetchEmailAndDemographics = async () => {
    const url = "http://localhost:11355/api/get-email"; // Your email fetching URL
    const token = localStorage.getItem("token"); // Token from local storage

    try {
      const emailResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const emailData = await emailResponse.json();
      console.log(emailData);

      setCurrUser(emailData || "");
      setIsLoading(false); // Stop loading after setting currUser
    } catch (error) {
      console.error("Error fetching email:", error);
      setIsLoading(false); // Stop loading if there's an error
    }
  };

  useEffect(() => {
    fetchEmailAndDemographics();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleForm = (data) => {
    console.log(data);

    const url = "http://localhost:11355/login";

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
          localStorage.setItem("token", res.data);
          swal
            .fire({
              icon: "success",
              title: res.message,
              timer: 1500,
            })
            .then(() => {
              // Remove the API call for setting the current user
              navigate("/dashboard");
            });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function Forgot_password() {
    navigate("/forgot_password");
  }

  return (
    <>
      <div className="container">
        <h1>User Login</h1>
      </div>

      <hr />
      <div className="alert alert-primary">
        <form onSubmit={handleSubmit(handleForm)} id={"form"}>
          <div className="mb-3">
            <label htmlFor="email">Email</label>
            <input
              {...register("email", { required: "This field is required" })}
              type="email"
              className={"form-control"}
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
            />
            <ErrorMessage
              errors={errors}
              name="password"
              render={({ message }) => (
                <p className={"text-danger"}>{message}</p>
              )}
            />
          </div>

          <button className={"btn btn-primary"} disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
        <button
          className={"btn btn-primary"}
          onClick={Forgot_password}
          style={{ marginTop: "10px" }}
        >
          Forgot Password
        </button>
      </div>
    </>
  );
};

export default UserLogin;
