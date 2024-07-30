import React, { useState} from "react";
import { Link } from 'react-router-dom'
import axios from "axios";
import API_BASE_URL from "../../config";
import Layout from '../../templates/Layout';
import ButtonResponse from "../Loading/ButtonResponse";

const Register = () => {
    const [formData, setFormData] = useState({
        'first_name': '',
        'last_name': '',
        'email': '',
        'username': '',
        'password': '',
        'confirm_password': '',
        
        
    })
    const [inputValidate, setInputValidate] = useState({
        first_name: false,
        last_name: false,
        email: false,
        username: false,
        password: false,
        confirm_password: false,
    });
    const [error, setError] = useState('');
    const [buttonRespond, setButtonRespond] = useState(true)

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setInputValidate({
            ...inputValidate,
            [name]: false,
        })
    }

    const validateInputs = () => {
        const errors = {
            first_name: !formData.first_name,
            last_name: !formData.last_name,
            email: !formData.email,
            username: !formData.username,
            password: !formData.password,
            confirm_password: !formData.confirm_password,
        };
        setInputValidate(errors)
    }

    const formSubmission = async (e) => {
        e.preventDefault();
        setButtonRespond(false)
        if(formData.password !== formData.confirm_password){
            setError('Passwords does not match.!')
            setButtonRespond(true)
            return;
        }
        const hasNullOrEmpytValue = Object.values(formData).some(value => value === null || value === undefined || value === '');
        if(hasNullOrEmpytValue){
            setError('Please fill in all required fields.')
            validateInputs();
            setButtonRespond(true)
            return;
        }

        try{
            await axios.post(`${API_BASE_URL}/api/register`, formData);
            window.location.href = '/login';
        }catch(error){
            if(error.response.status === 400){
                const errorData = error.response.data;
                console.log(errorData)
                if(errorData.username){                    
                    setError(`Registration Failed: ${errorData.username[0]}`)
                }
                if(errorData.email){
                    setError(`Registration Failed: ${errorData.email[0]}`)
                }
                
            }else{
                setError(`Registration Failed: ${error}`)
            }
            setButtonRespond(true)
        }
        
    }

    return(
        <Layout>
                <div className="container text-center signin-div pb-5">
                <h1 className="my-5">Register <br/> <i className="bi bi-dash-lg"></i></h1>
                {error && <div className="alert alert-danger d-inline-block register-error">{error}</div>}
                <form onSubmit={formSubmission}>
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-12">
                            <input type='text' className={`${inputValidate.first_name ? 'is-invalid' : ''}`} name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 col-12">
                            <input type="text" className={`${inputValidate.last_name ? 'is-invalid' : ''}`} name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 col-12">
                            <input type="email" className={`${inputValidate.email ? 'is-invalid' : ''}`} name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 col-12">
                            <input type="text" className={`${inputValidate.username ? 'is-invalid' : ''}`} name="username" placeholder="Username" value={formData.username} onChange={handleChange} /> 
                        </div>
                        <div className="col-md-6 col-12">
                            <input type="password" className={`${inputValidate.password ? 'is-invalid' : ''}`} name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 col-12">
                            <input type="password" className={`${inputValidate.confirm_password ? 'is-invalid' : ''}`} name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} />
                        </div>
                        <div className="col-12">
                            {buttonRespond
                                ?<button type="submit" className="btn btn-dark mt-2 mb-4">Sign Up</button>
                                :<ButtonResponse buttonTitle={"Signing Up..."} />
                            }
                        </div>
                    </div>
                </form>
                <div>Already a member? <Link to='/login'>Login here.</Link></div>
            </div>
        </Layout> 
    )
}

export default Register
