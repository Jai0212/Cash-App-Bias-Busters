import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserLogin = () => {
    const navigate = useNavigate();
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    async function handleForm(data) {
        console.log("Login form submitted with data:", data);

        try {
            const response = await fetch(`${VITE_BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Login successful:', result);

                swal.fire({
                    icon: "success",
                    title: "Logged in successfully!",
                    timer: 1500,
                }).then(() => {
                    document.getElementById('loginForm').reset();
                    navigate('/dashboard');
                });
            } else {
                const error = await response.json();
                console.error('Error:', error);
                swal.fire({
                    icon: "error",
                    title: "Login failed",
                    text: error.message || "Invalid credentials!",
                });
            }
        } catch (error) {
            console.error('Error:', error);
            swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Unable to reach the server.",
            });
        }
    }

    return (
        <>
            <div className="container">
                <h1>User Login</h1>
            </div>

            <hr />
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id="loginForm">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                {...register('email', { required: 'Email is required' })}
                                type="email"
                                className="form-control"
                                id="email"
                            />
                            <ErrorMessage
                                errors={errors}
                                name="email"
                                render={({ message }) => <p className="text-danger">{message}</p>}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="password">Password</label>
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type="password"
                                className="form-control"
                                id="password"
                            />
                            <ErrorMessage
                                errors={errors}
                                name="password"
                                render={({ message }) => <p className="text-danger">{message}</p>}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Login</button>

                    {/* Sign Up Button */}
                    <div className="mt-3">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/signup')}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UserLogin;
