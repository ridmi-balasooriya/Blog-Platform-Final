import React, {useState} from "react"; 
import axios from "axios";
import API_BASE_URL from "../../config";
import Layout from '../../templates/Layout';
import ButtonResponse from "../Loading/ButtonResponse";

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [buttonRespond, setButtonRespond] = useState(true)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonRespond(false)
        try{
            await axios.post(`${API_BASE_URL}/api/password_reset`, {email});
            setSuccess(true)
        }catch(error){
            if(error.response.status === 400){
                const errorData = error.response.data;
                console.log(errorData)
                if(errorData.email){
                    setError(`${errorData.email[0]}`)
                }
                
            }else{
                setError(error)
            }
            setButtonRespond(true)
            
        }

    }

    return(
        <Layout>
            {error && <div className="alert alert-danger password-rest-alert fs-6 text-center my-5 mx-auto">{error}</div>}
            {success ? (<div className="alert alert-success password-rest-alert fs-5 text-center my-5 mx-auto">Password reset email sent. Check your inbox.</div>)
                     : (
                        <div className="container text-center signin-div pb-5">
                            <h1 className="my-5">Reset Password <br/> <i className="bi bi-dash-lg"></i></h1>
                            <form onSubmit={handleSubmit}>
                                <input type="email" name="email" placeholder="Enter Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                {buttonRespond
                                    ?<button type="submit" className="btn btn-dark mt-2 mb-4">Reset Password</button>
                                    :<ButtonResponse buttonTitle={"Sending..."} />
                                    
                                }
                            </form>
                        </div>
                     )
            
            }
        </Layout>
    )
}

export default PasswordReset;