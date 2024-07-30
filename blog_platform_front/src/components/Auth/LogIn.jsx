import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import API_BASE_URL from '../../config';
import Layout from '../../templates/Layout';
import ButtonResponse from "../Loading/ButtonResponse";

const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [inputValidate, setInputValidate] = useState({
        username: false,
        password: false,
    });
    const [buttonRespond, setButtonRespond] = useState(true)

    const handleLogin = async (e) =>{
        e.preventDefault();
        setButtonRespond(false)

        if((!username) || (!password)){
            const errors = {
                username: !username,
                password: !password,
            }

            setInputValidate(errors)
            setError('Username and Password cannot be empty.')
            setButtonRespond(true)
            return
        }else{
            const errors = {
                username: !username,
                password: !password,
            }
            setInputValidate(errors)
            setError('')
        }

        try{
            const response = await axios.post(`${API_BASE_URL}/api/token`, {username, password});
            const token = response.data.token; // Assuming the response contains the token upon successful login.
            localStorage.setItem('token', token);  // Store the token securely (e.g., in local storage).

            const userData = {
                id: response.data.user_id,
                username: response.data.user_name,
            }
            localStorage.setItem('userData',JSON.stringify(userData))
            window.location.href = '/'; // Redirect to the home page or any desired page.
        }catch (error) {
            setError('Invalid Login Credentials')
            setButtonRespond(true)
        }
    };

    return(
        <Layout>
            <div className="container text-center signin-div pb-5">
                <h1 className="my-5">Login <br/> <i className="bi bi-dash-lg"></i></h1>
                {error && <div className="alert alert-danger d-inline-block">{error}</div>}
                <form onSubmit={handleLogin}>
                    <input type="text" className={`${inputValidate.username ? 'is-invalid' : ''}`} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /> 
                    <input type="password" className={`${inputValidate.password ? 'is-invalid' : ''}`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {buttonRespond 
                        ?<button type="submit" className="btn btn-dark mt-2 mb-4">Login</button>
                        :<ButtonResponse buttonTitle={"Logging In. . ."} />
                    }
                </form>
                <div><Link to='/password_reset'>Forgot Your Password?</Link> | New to Our Platform? <Link to='/register'>Please Register</Link></div>
            </div>
        </Layout>
    )

}

export default LogIn