import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useState } from 'react';

const ChangePassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const handleForm = (data) => {
        console.log(data);

        const url = "http://127.0.0.1:5000/change_password";

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
                    swal.fire({
                        icon: "error",
                        title: res.message,
                    });
                } else {
                    document.getElementById('form').reset();
                    swal.fire({
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
        <>
            <div className="container">
                <h1> Change Password </h1>
            </div>

            <hr />
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id={'form'}>
                    <div className="mb-3">
                        <label htmlFor="">Enter Old Password</label>
                        <input
                            {...register('old_password', { required: 'This field is required' })}
                            type="password"
                            className={"form-control"}
                        />
                        <ErrorMessage
                            errors={errors}
                            name="old_password"
                            render={({ message }) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="">Enter New Password</label>
                        <input
                            {...register('new_password', { required: 'This field is required' })}
                            type="password"
                            className={"form-control"}
                        />
                        <ErrorMessage
                            errors={errors}
                            name="new_password"
                            render={({ message }) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="">Confirm Password</label>
                        <input
                            {...register('confirm_password', { required: 'This field is required' })}
                            type="password"
                            className={"form-control"}
                        />
                        <ErrorMessage
                            errors={errors}
                            name="confirm_password"
                            render={({ message }) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <button className={"btn btn-primary"}>Change Password</button>
                </form>
            </div>
        </>
    );
};

export default ChangePassword;
