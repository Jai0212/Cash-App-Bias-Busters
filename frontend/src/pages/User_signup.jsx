import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const User_signup = () => {
    const navigate = useNavigate();
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    async function handleForm(data) {
        console.log("Form submitted with data:", data);

        try {

            const response = await fetch(`${VITE_BACKEND_URL}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);

                swal.fire({
                    icon: "success",
                    title: "Form submitted successfully!",
                    timer: 1500,
                }).then(() => {
                    // Reset form
                    document.getElementById('form').reset();
                    navigate('/');
                });
            } else {
                const error = await response.json();
                console.error('Error:', error);
                swal.fire({
                    icon: "error",
                    title: "Error submitting form",
                    text: error.message || "Something went wrong!",
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
                <h1>User Sign Up</h1>
            </div>

            <hr />
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id="form">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="firstname">First Name</label>
                            <input
                                {...register('firstname', { required: 'First Name is required' })}
                                type="text"
                                className="form-control"
                                id="firstname"
                            />
                            <ErrorMessage
                                errors={errors}
                                name="firstname"
                                render={({ message }) => <p className="text-danger">{message}</p>}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="lastname">Last Name</label>
                            <input
                                {...register('lastname', { required: 'Last Name is required' })}
                                type="text"
                                className="form-control"
                                id="lastname"
                            />
                            <ErrorMessage
                                errors={errors}
                                name="lastname"
                                render={({ message }) => <p className="text-danger">{message}</p>}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                {...register('email', { required: 'This field is required' })}
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
                                {...register('password', { required: 'This field is required' })}
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

                        <div className="col-md-6 mb-3">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                {...register('confirmPassword', { required: 'This field is required' })}
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                            />
                            <ErrorMessage
                                errors={errors}
                                name="confirmPassword"
                                render={({ message }) => <p className="text-danger">{message}</p>}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </>
    );
};

export default User_signup;
