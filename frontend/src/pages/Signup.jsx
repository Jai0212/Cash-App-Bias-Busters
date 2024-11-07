import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';

const UserSignup = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    function handleForm(data) {
        console.log(data);
        const { password, confirmPassword } = data;

        if (password !== confirmPassword) {
            swal.fire({
                icon: "error",
                title: "Passwords do not match",
            });
            return;
        }

        const url = "http://localhost:11395/form";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(res => {
                if (res.error === true) {
                    swal.fire({
                        icon: "error",
                        title: res.message,
                    });
                } else {
                    document.getElementById('form').reset()
                    swal.fire({
                        icon: "success",
                        title: res.message,
                        timer: 1500
                    }).then(()=>{
                        navigate('/')
                    })
                }
            })
            .catch((e) => {
                console.log(e);
            });
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

                    <div className="row row-email">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                {...register('email', { required: 'This field is required' })}
                                type="email"
                                className="form-control w-100"
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

export default UserSignup;
