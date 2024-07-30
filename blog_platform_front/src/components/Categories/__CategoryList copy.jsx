import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import {token, userData} from "../Auth/Token";

const CategoryList = () => {
    const [categoryList, setCategoryList] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        author: userData.id,
    })
    const [editCategoryId, setEditCategoryId] = useState(null)
    const [eidtCategoryName, setEditCategoryName] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] =useState('')

    // Get Category List
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/categories`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(response => {
            console.log(response.data)
            setCategoryList(response.data)
        })
    }, [])

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
        
        console.log("isNameAlreadyExist:", isNameAlreadyExist);
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
    }

    const handleSubmission = (e) => {
        e.preventDefault();
        clearMessages()
        const isExist = alreadyExisit(formData.name)
        const isNull = checkForNull(formData.name)
        console.log(formData)
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

    //Edit Category
    const handleEditClick = (categoryId, categoryName) => {
        clearMessages()
        setEditCategoryId(categoryId)
        setEditCategoryName(categoryName)
    }
    
    const handleSaveEditClick = (categoryId) => {
        clearMessages()
        const isExist = alreadyExisit(eidtCategoryName)
        const isNull = checkForNull(eidtCategoryName)
        
        if(!isExist && !isNull){
            axios.put(`${API_BASE_URL}/api/categories/${categoryId}/`, 
            { name: eidtCategoryName },
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const updateCategoryList = categoryList.map(category => {
                    if(category.id === categoryId){
                        return {...category, name: eidtCategoryName}
                    }
                    return category
                })
                setCategoryList(updateCategoryList)

                setEditCategoryId(null) 
                setEditCategoryName('')  

                setSuccess('Category Updated Successfully..!')
                timeOutSuccess()         
            })
            .catch(error => {
                setError(`Error updating category: ${error}`)
            })
        }else{
            setEditCategoryId(null)
        }
    }

    const handleCancelEditClick = () => {
        clearMessages()
        setEditCategoryId(null)
    }

    //Delete Category
    const handleDeleteClick = (categoryId, categoryName) => {
        clearMessages()
        const confirmDelete = window.confirm(`PLEASE BEWARE..!!! Are you sure you want to delete "${categoryName}" category? This will make all the post with this category moves to "Uncategory" list.`)
        if(confirmDelete){
            axios.delete(`${API_BASE_URL}/api/categories/${categoryId}`,
                { 
                    headers : { Authorization: `Token ${token}`}
                }
            ).then(response => {
                
                setCategoryList(prevCategoryList => prevCategoryList.filter(category => category.id !== categoryId))

                setSuccess(`"${categoryName} "Catergory is deleted successfully..! All the post with this category moves to "Uncategory" list.`)
                timeOutSuccess() 
            }).catch(error => {
                setError(`Error deleting catergory: ${categoryName}: ${error}`)
                console.log(`Error deleting catergory: ${categoryName}: ${error}`)
            })
        }
    }
    return(
        <div>
            <h1>Categories</h1>
            {success && <div>{success}</div>}
            {error && <div>{error}</div>}
            <form onSubmit={handleSubmission}>
                <input type="text" name="name" value={formData.name} onChange={handleNewCategory} />
                <button type="submit">Add New Category</button>
            </form>
            <ul>
                {categoryList.map(category => (
                    (category.name !== 'Uncategory') &&
                    <li key={category.id}>
                        {editCategoryId && (editCategoryId === category.id)
                        ? 
                            <div>
                                <input type="text" value={eidtCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                                <button onClick={() => handleSaveEditClick(category.id, category.name)}>Save</button>
                                <button onClick={handleCancelEditClick}>Cancel</button>
                            </div>
                        :     
                            <div>                      
                                <span>{category.name}</span>
                                <span>{category && token && (userData.id === category.author) && <button onClick={() => handleEditClick(category && category.id, category && category.name)}>Edit</button>}</span>
                                <span>{category && token && (userData.id === category.author) && <button onClick={() => handleDeleteClick(category && category.id, category && category.name)}>Delete</button>}</span>
                            </div>
                        }                        
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CategoryList;