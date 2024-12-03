import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Swal from "sweetalert2";
import { envConfig } from "../../envConfig";
import "./ChangePassword.css";

const ChangePassword = () => {
  const VITE_BACKEND_URL = envConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleForm = (data) => {
    console.log(data);

    const url = `${VITE_BACKEND_URL}/change_password`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // Send only the old password, new password, and confirm password
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.data);
        if (res.error === true) {
          Swal.fire({
            icon: "error",
            title: res.message,
          });
        } else {
          document.getElementById("form").reset();
          Swal.fire({
            icon: "success",
            title: res.message,
            timer: 1500,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="main-container-password">
      <div className="container-password">
        <h1 data-testid="Change Password"> Change Password </h1>
      </div>

      <hr />
      <div className="alert alert-primary2">
        <form onSubmit={handleSubmit(handleForm)} id="form">
          <div className="mb-3">
            <label htmlFor="old_password">Enter Old Password</label>
            <input
              id="old_password"
              {...register("old_password", {
                required: "This field is required",
              })}
              type="password"
              className="form-control"
            />
            <ErrorMessage
              errors={errors}
              name="old_password"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="new_password">Enter New Password</label>
            <input
              id="new_password"
              {...register("new_password", {
                required: "This field is required",
              })}
              type="password"
              className="form-control"
            />
            <ErrorMessage
              errors={errors}
              name="new_password"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              {...register("confirm_password", {
                required: "This field is required",
              })}
              type="password"
              className="form-control"
            />
            <ErrorMessage
              errors={errors}
              name="confirm_password"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </div>

          <button className="btn btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
