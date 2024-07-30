import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import LoadingSpinner from "../Loading/LoadingSpinner";
import {token, userData} from "../Auth/Token";
import AddCategory from "./AddCategory";

const CategoryList = () => {
    const [categoryList, setCategoryList] = useState([])
    const [editCategoryId, setEditCategoryId] = useState(null)
    const [eidtCategoryName, setEditCategoryName] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] =useState('')
    const [filterCategory, setFilterCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Get Category List
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/categories/`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(response => {
            setCategoryList(response.data)
        })
        .finally(() => {
            setIsLoading(false);
        });
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

    const handleCategoryAdded = (newCategory) => {
        setCategoryList((prevCategoryList) => [...prevCategoryList, newCategory])
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
            axios.delete(`${API_BASE_URL}/api/categories/${categoryId}/`,
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
        <div className="category-list container pb-5">
            <h1 className="text-center mt-5 mb-2">Categories <br/> <i className="bi bi-dash-lg"></i></h1>
            <AddCategory onAddCategory={handleCategoryAdded} onFilterChange={setFilterCategory}/>
            {success && <div className="alert alert-success text-center"><i className="bi bi-check-circle me-1"></i> {success}</div>}
            {error && <div className="alert alert-danger text-center"><i className="bi bi-x-circle me-1"></i> {error}</div>}
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <div className="row">
                    {categoryList.filter(category => category.name.toLowerCase().includes(filterCategory.toLowerCase())).map(category => (
                        (category.name !== 'Uncategory') &&
                        <div key={category.id} className="col-lg-6 col-xl-4 category-div">
                            {editCategoryId && (editCategoryId === category.id)
                            ? 
                                <div className="m-2 fs-5 d-flex flex-row p-3 edit-category">
                                    <div className="flex-grow-1">
                                        <input className="py-2 form-control" type="text" value={eidtCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-dark mx-1 " onClick={() => handleSaveEditClick(category.id, category.name)}><i className="bi bi-floppy"></i></button>
                                        <button className="btn btn-dark mx-1" onClick={handleCancelEditClick}><i className="bi bi-x-circle"></i></button>
                                    </div>
                                </div>
                            :     
                                <div className="my-2 fs-5 d-flex flex-row p-3"> 
                                    <div className="flex-grow-1">{category.name}</div>
                                    <div className="text-end">
                                        <span>{category && token && (userData.id === category.author) && <button className="btn btn-dark mx-1" onClick={() => handleEditClick(category && category.id, category && category.name)}><i className="bi bi-pencil-square"></i></button>}</span>
                                        <span>{category && token && (userData.id === category.author) && <button className="btn btn-dark mx-1" onClick={() => handleDeleteClick(category && category.id, category && category.name)}><i className="bi bi-trash3"></i></button>}</span>
                                    </div>
                                    
                                </div>
                            }                        
                        </div>
                    ))}
                </div>
            )}            
        </div>
    )
}

export default CategoryList;