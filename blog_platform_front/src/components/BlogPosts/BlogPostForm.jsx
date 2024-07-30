import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import API_BASE_URL from '../../config';
import LoadingSpinner from "../Loading/LoadingSpinner";
import { useLocation, useNavigate } from 'react-router-dom';
import { token, userData } from '../Auth/Token';
import AddCategory from '../Categories/AddCategory';
import AddTag from '../Tags/AddTag';
import ButtonResponse from "../Loading/ButtonResponse";

const BlogPostForm = ({ postId }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const successMessage = location.state && location.state.successMessage;
    const id = postId
    const isEditing = !!id
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null,
        category: {},
        tags: [],
        is_public: false,
        author: userData.id,
        slug:'',
        meta_description:'',
    })
    const [inputValidate, setInputValidate] = useState({
        title: false,
        content: false,
        category: false,
        image: false,
    });
    const [categories, setCategories]= useState([])
    const [tags, setTags]= useState([])
    const [success, setSuccess] = useState(successMessage)
    const [error, setError] = useState('')
    const [imgError, setImgError] = useState('')
    const [viewPostData, setViewPostData] = useState({
        id:'',
        slug:'',
        author:userData.username,
    })
    const [authorDetails,setAuthorDetails] = useState({})
    const [selectedImage, setSelectedImage] = useState(null);
    const [tagChecked, setTagChecked] = useState([])
    const [categoryChecked, setCategoryChecked] = useState([])
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTags, setFilterTags] = useState('');
    const [buttonRespond, setButtonRespond] = useState(true)

    const clearMessages = () => {
        setSuccess('')
        setError('')
    }

    const timeOutSuccess = (time = 5000) => {
        setTimeout(() => {
            setSuccess('');
        }, time);
    }
    
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(isEditing){      
             setIsLoading(true)
            axios.get(`${API_BASE_URL}/api/posts/${id}/`, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}})
            .then(response => {
                setFormData(response.data)
                setSelectedImage(response.data.image)
                setTagChecked(response.data.tags.map(tag => tag.id))
                setCategoryChecked(response.data.category.id)
                setViewPostData({
                    id:response.data.id,
                    slug:response.data.slug,
                    author:userData.username,
                })
            })
            .catch(error => {
                setError(`Error fetching blog post: ${error}`)
                console.error(`Error fetching blog post: ${error}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
            timeOutSuccess();
        }
              
        //Fetch Category List
        axios.get(`${API_BASE_URL}/api/categories/`, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}})
        .then(response => {
            setCategories(response.data)
        })
        .catch(error => {
            setError(`Error fetching categories: ${error}`)
            console.error(`Error fetching categories: ${error}`);
        })

        //Fetch Tags
        axios.get(`${API_BASE_URL}/api/tags/`, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}})
        .then(response => {
            setTags(response.data)
        })
        .catch(error => {
            setError(`Error fetching tags: ${error}`)
            console.error(`Error fetching tags: ${error}`);
        })

        //Fetch Author Details
        axios.get(`${API_BASE_URL}/api/users/${formData.author}/`, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'application/json',}})
        .then(response => {
            const fetchedAuthorDetails = response.data;
            setAuthorDetails(fetchedAuthorDetails)
            
        })
        .catch(error => {
            console.error(`Error fetching author data: ${error}`);
        });
        
    }, [isEditing]);


    //Callback when add new category to update the category list
    const handleCategoryAdded = (newCategory) => {
        setCategories((prevCategories) => [...prevCategories, newCategory])
    }
    //Callback when add new tag to update the tag list
    const handleTagAdded = (newTag) => {
        setTags((prevTags) => [...prevTags, newTag])
    }

    const handleChangeFormData = (e) => {
        const { name, value} = e.target
        setFormData({
            ...formData,
            [name]: value,
        })   

        if(name === 'title'){
            const slugName = value.toLowerCase().replace(/\s+/g, '-');
            setFormData({
                ...formData,  
                [name]: value,              
                slug: slugName,
            })

            setInputValidate({
                ...inputValidate,
                title: false,
            }) 
        }
        
    }

    const handleChangeCategory = (e) => {
        const { name, value} = e.target
        setFormData({
            ...formData,
            [name]: {id: value, name: e.innerText},
        })          
        setCategoryChecked(value); 
        setInputValidate({
            ...inputValidate,
            category:false,
        })       
    }

    const hanldeChangePublic = (e) => {
        const { name, value} = e.target
        setFormData({
            ...formData,
            [name]: value,
        })  
    }
    const handleTagChange = (tagId) => {
        setTagChecked((prevTagChecked) => {
            if(prevTagChecked.includes(tagId)){
                return prevTagChecked.filter((id) => id !== tagId)
            }else{
                return [...prevTagChecked, tagId]
            }
        })
        setInputValidate({
            ...inputValidate,
            tags:false,
        })
    }

    const handleImageChange = (e) => {
        const image = e.target.files[0]

        if (image) {
            const reader = new FileReader();   
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const {width, height} = img;
                    if((width !== 1260) && (height !== 400)){
                        setImgError('Article Image size should be 1260px x 400px. Please ajust the image width and height before uploading.')
                    }else{
                        setImgError('');
                        setFormData({
                            ...formData,
                            image: image,
                        })
                        setSelectedImage(e.target.result);
                    }
                }
            };    

            reader.readAsDataURL(image);

        } else {
            setFormData({
                ...formData,
                image: image,
            })
            setSelectedImage(null);
        }
        setInputValidate({
            ...inputValidate,
            image:false,
        })
    }

    const handleContentChange = (newContent) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            content: newContent,
        }))
        setInputValidate({
            ...inputValidate,
            content:false,
        })
    }
    
    const validateInputs = () => {
        const errors = {
            title: !formData.title,
            content: !formData.content,
            category: !formData.category.id,
            image: !formData.image,
            tags: tagChecked.length === 0
        };
        setInputValidate(errors)
    }
    
    const handleSubmission = (e) => {    
        e.preventDefault();
        clearMessages()
        
        if((!formData.title) || (!formData.content) || (!formData.category.id) || (!formData.image) || (tagChecked.length === 0)){
            setError('Please fill in all required fields.')
            validateInputs();
            setButtonRespond(true);
            return
        }

        const postData = new FormData();
        postData.append('title', formData.title)
        postData.append('content', formData.content)  
        postData.append('author', formData.author)
        postData.append('category', formData.category.id)
        postData.append('is_public', formData.is_public)
        if(formData.slug){
            const slug = formData.slug.toLowerCase().replace(/\s+/g, '-');
            postData.append('slug', slug)
        }
        if(formData.meta_description){
            postData.append('meta_description', formData.meta_description)
        }else{
            postData.append('meta_description', '')
        }
        
        
        tagChecked.forEach((tagId) => {postData.append('tags', tagId)})

        if (typeof formData.image !== "string") {// If image is already exist it's in string if new one upload it's and fileobject. ONLY FILE OBJECTS can save in DB
            postData.append('image', formData.image)
        }
        
        if(id){
            //Update blog post            
            setButtonRespond(false);
            axios.put(`${API_BASE_URL}/api/posts/${id}/`, postData, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',}})
            .then(response => {
                setSuccess('Blog Post is Updated Successfully...');
                setViewPostData({
                    id:response.data.id,
                    slug:response.data.slug,
                    author:userData.username,
                })
                timeOutSuccess();
                setButtonRespond(true) 
            })
            .catch(error => {
                setError(`Error updating blog post: ${error}`)
                console.error(`Error updating blog post: ${error}`);
                setButtonRespond(true)
            })
        }else{ 
            setButtonRespond(false);
            axios.post(`${API_BASE_URL}/api/posts/`, postData, {headers: {Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',}})
            .then(response => {
                setSuccess('Blog Post is Created Successfully...');
                navigate(`/dashboard/?postId=${response.data.id}`, { state: { successMessage: 'Blog Post is Created Successfully...' } })
                setButtonRespond(true)
            })
            .catch(error => {
                setError(`Error creating blog post: ${error}`)
                console.error(`Error creating blog post: ${error}`);
                console.error('Error response:', error.response)
                setButtonRespond(true)
            })
        }   

          
    }

    
    return(
        <div className='article-editor'>
            <h1 className='text-center mt-2 my-3'>{isEditing ? 'Edit Article' : 'Create New Article'}  <br/> <i className="bi bi-dash-lg"></i></h1>           
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <>
                    <div className='row'>
                        <div className='col-lg-8 col-xl-9'>
                            <div className='article-section article-input-section'>
                                <div className='mb-3'>
                                    <label htmlFor='title' className="form-label col-form-label-lg">Title: </label>
                                    <input type='text' className={`form-control form-control-lg ${inputValidate.title ? 'is-invalid' : ''}`} name='title' value={formData.title} onChange={handleChangeFormData} />
                                </div> 
                                <div className='mb-3 content-div'>
                                    <label htmlFor='content'  className="form-label col-form-label-lg">Article:</label>
                                    <ReactQuill value={formData.content} className={`form-control form-control-lg p-0 ${inputValidate.content ? 'is-invalid' : ''}`} onChange={handleContentChange} placeholder='Write your content here...' />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='image'  className="form-label col-form-label-lg">Article Image:  </label>
                                    <div className='article-image-div'>                                
                                        {selectedImage &&
                                            <img src={selectedImage} alt="Selected thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                        }
                                        {imgError && <div className="alert alert-danger text-center p-1 fs-6"><i className="bi bi-exclamation-triangle me-1"></i> {imgError}</div> }
                                        <input type='file' className={`form-control ${inputValidate.image ? 'is-invalid' : ''}`} name='image' accept='image/*' onChange={handleImageChange} />
                                    </div>                            
                                    <div id="imageHelp" className="form-text">Article Image size should be 1260px x 400px</div>
                                </div>
                            </div>

                            <div className='article-section meta-input-section'>
                                <div className='mb-3'>
                                    <label htmlFor='slug' className="form-label col-form-label-lg">Slug: </label>
                                    <input type='text' name='slug' className="form-control" value={formData.slug} onChange={handleChangeFormData} />
                                </div>
                                <div>
                                    <label htmlFor='meta_description' className="form-label col-form-label-lg">Meta Description: </label>
                                    <textarea name='meta_description' className="form-control" value={formData.meta_description} onChange={handleChangeFormData}></textarea>
                                </div>
                            </div>   
                        </div>
                        <div className='col-lg-4 col-xl-3 article-section-right'>
                            <div className='article-section'>
                                <label className="form-label col-form-label-lg">Author <br/> <i className="bi bi-dash-lg"></i></label> 
                                <div className='fs-5 mb-4'>{authorDetails.first_name} {authorDetails.last_name}</div>
                                {viewPostData.slug && <a href={`/posts/${viewPostData.author}/${viewPostData.id}/${viewPostData.slug}`} target="_blank"className="btn btn-dark d-block" rel="noopener noreferrer">View Article</a>}
                            </div>  
                            <div className='article-section'>
                                <label htmlFor='is_public' className="form-label col-form-label-lg">Article Status <br/> <i className="bi bi-dash-lg"></i></label>
                                <select name='is_public' className='form-select' onChange={hanldeChangePublic} value={formData.is_public}>
                                    <option value={false}>Draft</option>
                                    <option value={true}>Public</option>
                                </select>
                            </div>
                            <div className='article-section'>
                                <label htmlFor='category' className="form-label col-form-label-lg">Category<br/> <i className="bi bi-dash-lg"></i></label>
                                <AddCategory onAddCategory={handleCategoryAdded} onFilterChange={setFilterCategory} />                        
                                <div className={`category-list-div ${inputValidate.category ? 'is-invalid' : ''}`} onChange={handleChangeCategory} value={formData.category.id}>                            
                                    {categories.length > 0 && categories
                                        .filter(category => category.name.toLowerCase().includes(filterCategory.toLowerCase()))
                                        .map(category => (
                                            <div className={`form-check py-1 ${category.id === parseInt(categoryChecked, 10) ? 'checked' : ''}`} key={category.id}>
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="category" 
                                                    id={`category${category.id}`} 
                                                    value={category.id} 
                                                    checked={category.id === parseInt(categoryChecked, 10)}
                                                    onChange={handleChangeCategory} // The actual change is handled by the div
                                                />
                                                <label className="form-check-label" htmlFor={`category${category.id}`}>
                                                    {category.name}
                                                </label>
                                            </div>
                                    ))}
                                </div>
                            </div>
                            <div className='article-section'>
                                <label htmlFor='tags' className="form-label col-form-label-lg">Tags<br/> <i className="bi bi-dash-lg"></i></label>
                                <AddTag onAddTag={handleTagAdded} onFilterChange={setFilterTags} />  
                                <div className={`tag-list-div py-3 ${inputValidate.tags ? 'is-invalid' : ''}`}>
                                    {tags.length > 0 && tags.filter(tag => tag.name.toLowerCase().includes(filterTags.toLowerCase())).map(tag => (
                                        <div key={tag.id} className={`form-check py-1 ${tagChecked.includes(tag.id) ? 'checked' : ''}`}>
                                            <input type='checkbox' className="form-check-input" name='tags' id={`tag${tag.id}`} value={tag.id} onChange={() => handleTagChange(tag.id)} checked={tagChecked.includes(tag.id)}/>                                                                                   
                                            <label className="form-check-label" htmlFor={`tag${tag.id}`}>{tag.name}</label>
                                        </div>                           
                                    ))}  
                                </div> 
                            </div>
                        </div> 
                        <div className="text-end">
                            {error && <div className="alert alert-danger text-center"><i className="bi bi-x-circle me-1"></i>{error}</div>}
                            {success && <div className="alert alert-success text-center"><i className="bi bi-check-circle me-1"></i> {success}</div>} 
                            {buttonRespond 
                                ? <button className="btn btn-dark" onClick={handleSubmission}>{isEditing ? 'Update' : 'Create'} Article</button>
                                : <ButtonResponse buttonTitle={isEditing ? 'Updating Article...' : 'Creating Article...'} />
                            }
                        </div>   
                    </div>  
                </>
                )}
        </div>
    )
}

export default BlogPostForm