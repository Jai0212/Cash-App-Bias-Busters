import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const UserLogin = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function handleForm(data) {
    console.log("Login form submitted with data:", data);
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  function Forgot_password() {
    navigate('/forgot_password');
  }

  return (
    <div className="container">
  <div className="form-container">
    <h1 className="header">User Login</h1> {/* Title inside the form container */}
    <form onSubmit={handleSubmit(handleForm)} id="form">
      <div className="input-container">
        <label htmlFor="email" className="label">Email</label>
        <input
          {...register('email', { required: 'This field is required' })}
          type="email"
          className="input"
        />
        <ErrorMessage
          errors={errors}
          name="email"
          render={({ message }) => <p className="error">{message}</p>}
        />
      </div>
      <div className="input-container">
        <label htmlFor="password" className="label">Password</label>
        <input
          {...register('password', { required: 'This field is required' })}
          type="password"
          className="input"
        />
        <ErrorMessage
          errors={errors}
          name="password"
          render={({ message }) => <p className="error">{message}</p>}
        />
      </div>
      <button className="button">Login</button>
    </form>
    <button onClick={Forgot_password} className="forgot-button">Forgot Password?</button>
  </div>
</div>
  );
}

export default UserLogin;