import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
    const navigate = useNavigate();

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
        } catch (error) {
            console.error("Error during login:", error);
        }
    }

    function handleForm(data) {
        console.log(data);

        const url = "http://localhost:11345/login";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(res => {
                console.log(res.data);
                if (res.error === true) {
                    swal.fire({
                        icon: "error",
                        title: res.message,
                    });
                } else {
                    document.getElementById('form').reset();
                    localStorage.setItem('token', res.data);
                    swal.fire({
                        icon: "success",
                        title: res.message,
                        timer: 1500
                    }).then(() => {
                        navigate('/dashboard');
                    });
                }
            })
            .catch((e) => {
                console.log(e);
            });
    }
    
    function Forgot_password(){
        navigate('/forgot_password');
    }
    

    return (
        <>
            <div className="container">
                <h1>User Login</h1>
            </div>

            <hr />
            <div className="alert alert-primary">
                <form onSubmit={handleSubmit(handleForm)} id={'form'}>
                    <div className="mb-3">
                        <label htmlFor="email">Email</label>
                        <input {...register('email', {required: 'This field is required'})} type="email"
                               className={"form-control"}/>
                        <ErrorMessage
                            errors={errors}
                            name="email"
                            render={({message}) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <input {...register('password', {required: 'This field is required'})} type="password"
                               className={"form-control"}/>
                        <ErrorMessage
                            errors={errors}
                            name="password"
                            render={({message}) => <p className={"text-danger"}>{message}</p>}
                        />
                    </div>

                    <button className={"btn btn-primary"}>Login</button>
                </form>
                <button className={"btn btn-primary"} onClick={Forgot_password} style={{marginTop: '10px'}}>Forgot
                    Password
                </button>
            </div>
        </>
    );
}

export default UserLogin;
