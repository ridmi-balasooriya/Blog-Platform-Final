import React, {useState, useEffect} from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import API_BASE_URL from "../../config";
import LoadingSpinner from "../Loading/LoadingSpinner";
import { token, userData } from "../Auth/Token";

const MyProfile = () => {
    const [userProfile, setUserProfile] = useState({
        username: userData.username,
        email: '',
        first_name: '',
        last_name:'',
    });
    const [authorProfile, setAuthorProfile] = useState({
        author:userData.id,
        first_name: '',
        last_name:'',
        profile_pic:'',
        bio:''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [hasProfile, setHasProfile] = useState(true);
    const [editInput, setEditInput] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [imgError, setImgError] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/users/${userData.id}/`,
            {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}}
        ).then(response => {
            setUserProfile(response.data)         
        }).catch(error => {
            console.log(`Error: Retrieving User Profile ${error}`)
        })
        
        axios.get(`${API_BASE_URL}/api/author_profile/${userData.id}/`,
        {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}}
        ).then(response => {
            setAuthorProfile(response.data)
            setSelectedImage(response.data.profile_pic)
        }).catch(error => {
            console.log(`Error: Retrieving Author Profile ${error}`)
            if(error.response.status === 404){
                setHasProfile(false)
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    },[])


    useEffect(() => {        
        if(!hasProfile){
            const postData = new FormData();
            postData.append('author', userData.id)
            postData.append('first_name', userProfile.first_name)
            postData.append('last_name', userProfile.last_name)

            axios.post(`${API_BASE_URL}/api/author_profile/`, postData, 
                {headers: {Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',} }
            ).then(response => {
                setAuthorProfile(response.data)
            }).catch(error => {
                console.log(error)
            })
        }
    },[hasProfile, userProfile.first_name, userProfile.last_name])

    const timeOutSuccess = (time = 5000) => {
        setTimeout(() => {
            setSuccess('');
        }, time);
    }

    const timeOutError = (time = 5000) => {
        setTimeout(() => {
            setError('');
        }, time);
    }
    

    const hanldeChange = (e) => {
        const {name, value} = e.target
        setAuthorProfile({
            ...authorProfile,
            [name]: value
        })
    }

    const handleImageChange = (e) => {
        const profilePic = e.target.files[0]        
        if (profilePic) {
            const reader = new FileReader(); 
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result; 

                img.onload = () => {
                    const {width, height} = img;
                    if((width !== 150) && (height !== 150)){
                        setImgError('Your profile picture should be 150px x 150px. Please ajust the image width and height before uploading.')
                    }else{
                        setImgError('');
                        setSelectedImage(e.target.result);
                        setAuthorProfile({
                            ...authorProfile,
                            profile_pic: profilePic,
                        })
                    }
                }
            };    
            reader.readAsDataURL(profilePic);
        } else {
            setSelectedImage(null);
            setAuthorProfile({
                ...authorProfile,
                profile_pic: profilePic,
            })
        }
    }
            

    const handleSaveEditClick = () => {        
        const postData = new FormData();
        authorProfile.bio && postData.append('bio', authorProfile.bio)
        postData.append('first_name', authorProfile.first_name)
        postData.append('last_name', authorProfile.last_name)
        if ((typeof authorProfile.profile_pic !== "string") && (authorProfile.profile_pic !== null)) {
            // If proflie is already exist it's in string if new one upload it's and fileobject. ONLY FILE OBJECTS can save in DB
            postData.append('profile_pic', authorProfile.profile_pic)
        }

        axios.put(`${API_BASE_URL}/api/author_profile/${userData.id}/`, postData,
        {headers: {Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',}}
        ).then(response => {
            setAuthorProfile(response.data)
            setEditInput('')
            setSuccess('Profie Updated Successfully..!')
            timeOutSuccess();
        }).catch(error => {
            setError('Error Updating Proflie..!!')
            console.log(`Error: Updating Author Profile ${error}`)
            timeOutError();
        })
    }

    return(
        <div className="my_profile container pb-5">
            {success && <div className="alert alert-success text-center mt-5"><i className="bi bi-check-circle me-1"></i> {success}</div>}
            {error && <div className="alert alert-danger text-center mt-5"><i class="bi bi-x-circle me-1"></i> {error}</div>}
            <h1 className="text-center mt-5 mb-2">My Profile <br/> <i className="bi bi-dash-lg"></i></h1>
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <>
                <div className="text-center profile-info">
                    {editInput === 'profile_pic' 
                        ? <span>
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Selected thumbnail" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                                    ) 
                                    : ( 'Choose Image' )
                                }
                                {imgError && <div className="alert alert-danger text-center mt-2"><i class="bi bi-x-circle me-1"></i> {imgError}</div>}
                                <input className="form-control mt-2 mb-4" type='file' name='image' accept='image/*' onChange={handleImageChange} />
                                <button className="btn btn-dark mx-1" onClick={() => handleSaveEditClick()}>Save</button>
                                <button className="btn btn-dark mx-1" onClick={() => setEditInput('')}>Cancel</button>
                        </span>
                        : <>
                                {authorProfile.profile_pic 
                                ?   <span>
                                        <img className="mb-3" src={authorProfile.profile_pic} width='150px' height='150px' alt={`${authorProfile.first_name} ${authorProfile.last_name}`} />
                                        <br />
                                        <button className="btn btn-dark mx-1" onClick={() => setEditInput('profile_pic')}>Change Profie Picture</button>
                                    </span>
                                :   <span>
                                        <button className="btn btn-dark mx-1" onClick={() => setEditInput('profile_pic')}>Add Profile Picture</button>
                                    </span>
                                }
                                <div id="imageHelp" className="form-text mt-2">Proflie picture size should be 150px x 150px</div>
                        </>
                    }
                    
                </div>
                <div className="row">
                        <div className="col-lg-6 text-center mt-5">
                            <h4 className="text-center mt-5">Bio <br/> <i className="bi bi-dash-lg"></i></h4>
                            {editInput === 'bio' 
                                ? <div className="profile-info fs-5">
                                    <textarea className="form-control form-control-lg" name="bio" onChange={hanldeChange}>{authorProfile.bio}</textarea>
                                    <br />
                                    <button className="btn btn-dark mx-1" onClick={() => handleSaveEditClick()}>Save</button>
                                    <button className="btn btn-dark mx-1" onClick={() => setEditInput('')}>Cancel</button>
                                </div>
                                : <div className="profile-info fs-5">
                                        {authorProfile.bio && authorProfile.bio !== 'null'
                                        ?   <div className="profile-info">
                                                <span className="info-span">{authorProfile.bio}</span>
                                                <br />
                                                <button className="btn btn-dark mx-1" onClick={() => setEditInput('bio')}>Edit Bio</button>
                                            </div>
                                        :   <div>
                                                <button className="btn btn-dark mx-1" onClick={() => setEditInput('bio')}>Add Bio</button>
                                            </div>
                                        }                    
                                </div>                    
                            }
                        </div>
                        <div className="col-lg-6 text-center mt-5">
                            <h4 className="text-center mt-5">Name<br/> <i className="bi bi-dash-lg"></i></h4>
                            {editInput === 'name' 
                                ? <div className="profile-info fs-5">
                                    <div className="d-flex flex-row mb-4">
                                        <input className="form-control form-control-lg d-inline-block mx-1" type="text" name="first_name" value={authorProfile.first_name} onChange={hanldeChange} />
                                        <input className="form-control form-control-lg d-inline-block mx-1" type="text" name="last_name" value={authorProfile.last_name} onChange={hanldeChange} />
                                    </div>
                                    <button className="btn btn-dark mx-1"  onClick={() => handleSaveEditClick()}>Save</button>
                                    <button className="btn btn-dark mx-1"  onClick={() => setEditInput('')}>Cancel</button>
                                </div>
                                : <div className="profile-info fs-5">
                                    <span className="info-span">{authorProfile.first_name} {authorProfile.last_name}</span><br />
                                    <button className="btn btn-dark mx-1" onClick={() => setEditInput('name')}>Edit Name</button>
                                </div>
                            }     
                        </div>
                        <div className="col-lg-6">
                            <div className="profile-info fs-5 text-center">
                                <h4 className="text-center mt-5">UserName<br/> <i className="bi bi-dash-lg"></i></h4>
                                <span className="info-span">{userProfile.username}</span>
                            </div>
                        </div>
                        <div className="col-lg-6">
                        <div className="profile-info fs-5 text-center">
                            <h4 className="text-center mt-5">Email<br/> <i className="bi bi-dash-lg"></i></h4>
                            <span className="info-span">{userProfile.email}</span>
                        </div>
                        </div>
                    </div>

                    <div className="text-center mt-5"><Link className="btn btn-dark mx-1" to='/password_reset'>Change Your Password</Link></div> 
                </>
            )}                       
        </div>
    );
}

export default MyProfile