import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2'

const ChangePassword = () => {

    const token = localStorage.getItem("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    function handleForm(constant) {
        console.log(constant);

        const url = "http://localhost:11355/change_password";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(constant),

        })
            .then(res => res.json())
            .then(res => {
                console.log(res.data)
                if (res.error === true) {
                    swal.fire({
                        icon: "error",
                        title: res.message,
                    });
                } else {
                    document.getElementById('form').reset()
                    localStorage.setItem('token', res.data)
                    swal.fire({
                        icon: "success",
                        title: res.message,
                        timer: 1500
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
                <h1> Change Password </h1>
            </div>

            <hr/>
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id={'form'}>
                    <div className="mb-3">
                        <label htmlFor="">Enter Old Password</label>
                        <input {...register('old_password', {required: 'This field is required'})} type="password"
                               className={"form-control"}/>
                        <ErrorMessage
                            errors={errors}
                            name="old_password"
                            render={({message}) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="">Enter New Password</label>
                        <input {...register('new_password', {required: 'This field is required'})} type="password"
                               className={"form-control"}/>
                        <ErrorMessage
                            errors={errors}
                            name="new_password"
                            render={({message}) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="">Confirm Password</label>
                        <input {...register('confirm_password', {required: 'This field is required'})} type="password"
                               className={"form-control"}/>
                        <ErrorMessage
                            errors={errors}
                            name="confirm_password"
                            render={({message}) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>


                    <button className={"btn btn-primary"}>Change Password</button>


                </form>
            </div>
        </>
    )
}

export default ChangePassword