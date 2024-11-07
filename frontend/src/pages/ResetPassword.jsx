import { useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import { useLocation, useNavigate } from "react-router-dom";
import swal from 'sweetalert2';

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email; 

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    function handleForm(data) {
        const { newpassword, confirmpassword } = data;

        if (newpassword !== confirmpassword) {
            swal.fire({
                icon: "error",
                title: "Passwords do not match",
            });
            return;
        }

        const url = `http://localhost:11395/reset_password/${encodeURIComponent(email)}`;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newPassword: newpassword }),
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    swal.fire({
                        icon: "error",
                        title: res.message,
                    });
                } else {
                    swal.fire({
                        icon: "success",
                        title: res.message,
                        timer: 1500
                    }).then(() => navigate('/'));
                }
            })
            .catch((e) => {
                console.log(e);
            });
    }

    return (
        <>
            <div className="container">
                <h1> Reset Password </h1>
            </div>

            <hr />
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id={'form'}>
                    <div className="mb-3">
                        <label htmlFor="newpassword">Enter New Password</label>
                        <input
                            {...register('newpassword', { required: 'This field is required' })}
                            type="password"
                            className="form-control"
                        />
                        <ErrorMessage
                            errors={errors}
                            name="newpassword"
                            render={({ message }) => <p className="text-danger">{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmpassword">Confirm Password</label>
                        <input
                            {...register('confirmpassword', { required: 'This field is required' })}
                            type="password"
                            className="form-control"
                        />
                        <ErrorMessage
                            errors={errors}
                            name="confirmpassword"
                            render={({ message }) => <p className="text-danger">{message}</p>}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Reset Password</button>
                </form>
            </div>
        </>
    );
}

export default ResetPassword;
