import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import {token, userData} from "../Auth/Token";

const AddCategory = ({onAddCategory, onFilterChange}) => {
    const [categoryList, setCategoryList] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        author: userData.id,
    })

    const [success, setSuccess] = useState('')
    const [error, setError] =useState('')

    // Get Category List
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/categories/?search=${formData.name}`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(response => {
            setCategoryList(response.data)
        })
    }, [formData])

    const clearMessages = () => {
        setSuccess('')
        setError('')
    }
    
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

    //Check for already Existing Category
    const alreadyExisit = (categoryName) => {
        const isNameAlreadyExist = categoryList.some(category => 
            category.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if(isNameAlreadyExist){
            setError(`Category "${categoryName}" is already exists.`)
            timeOutError()
            return true
        }
        
        return false
    }

    const checkForNull = (categoryName) => {
        if (categoryName === null || categoryName.trim() === ''){
            setError(`Category cannot be null.`)
            timeOutError()
            return true
        }
        return false
    }

    //Add New Category
    const handleNewCategory = (e) => {
        const {name, value} = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
        onFilterChange(value);
    }

    

    const handleSubmission = (e) => {
        e.preventDefault();
        clearMessages()
        const isExist = alreadyExisit(formData.name)
        const isNull = checkForNull(formData.name)

        if(!isExist && !isNull){
            axios.post(`${API_BASE_URL}/api/categories/`, 
                formData, 
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            )
            .then(response => {
                setCategoryList([...categoryList, response.data])
                onAddCategory(response.data)
                setFormData({
                    name: '',
                    author: userData.id,
                })
                setSuccess('New Category is Added Successfully..!')
                timeOutSuccess() 
            })
            .catch(error => {
                setError(`Error Adding New Category: ${error}`)
            })
        }   
    }
    
    return(
        <div>
            {success && <div className="alert alert-success text-center"><i className="bi bi-check-circle me-1"></i> {success}</div>}
            {error && <div className="alert alert-danger text-center"><i className="bi bi-x-circle me-1"></i> {error}</div>}
            <form onSubmit={handleSubmission}>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleNewCategory} />
                    <button type="submit"><i className="bi bi-plus"></i></button>
                </div>                
            </form>           
        </div>
    )
}

export default AddCategory;