import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import LoadingSpinner from "../Loading/LoadingSpinner";
import {token, userData} from "../Auth/Token";
import AddTag from "./AddTag";

const TagList = () => {
    const [tagList, setTagList] = useState([])
    const [editTagId, setEditTagId] = useState(null)
    const [eidtTagName, setEditTagName] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] =useState('')
    const [filterTags, setFilterTags] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Get Tag List
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/tags/`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(response => {
            setTagList(response.data)
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

    const handleTagAdd = (newTag) => {
        setTagList((prevTagList) => [...prevTagList, newTag])
    }

    //Check for already Existing Tag
    const alreadyExisit = (tagName) => {
        const isNameAlreadyExist = tagList.some(tag => 
            tag.name.toLowerCase() === tagName.toLowerCase()
        );
        
        if(isNameAlreadyExist){
            setError(`Tag "${tagName}" name already exists.`)
            timeOutError()
            return true
        }
        
        return false
    }

    const checkForNull = (tagName) => {
        if (tagName === null || tagName.trim() === ''){
            setError(`Tag cannot be null.`)
            timeOutError()
            return true
        }
        return false
    }

    //Edit Tag
    const handleEditClick = (tagId, tagName) => {
        clearMessages()
        setEditTagId(tagId)
        setEditTagName(tagName)
    }
    
    const handleSaveEditClick = (tagId) => {
        clearMessages()
        const isExist = alreadyExisit(eidtTagName)
        const isNull = checkForNull(eidtTagName)
        
        if(!isExist && !isNull){
            axios.put(`${API_BASE_URL}/api/tags/${tagId}/`, 
            { name: eidtTagName },
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const updateTagList = tagList.map(tag => {
                    if(tag.id === tagId){
                        return {...tag, name: eidtTagName}
                    }
                    return tag
                })
                setTagList(updateTagList)

                setEditTagId(null) 
                setEditTagName('')  

                setSuccess('Tag Updated Successfully..!')
                timeOutSuccess()         
            })
            .catch(error => {
                setError(`Error updating tag: ${error}`)
            })
        }else{
            setEditTagId(null)
        }
    }

    const handleCancelEditClick = () => {
        clearMessages()
        setEditTagId(null)
    }

    //Delete Tag
    const handleDeleteClick = (tagId, tagName) => {
        clearMessages()
        const confirmDelete = window.confirm(`PLEASE BEWARE..!!! Are you sure you want to delete "${tagName}" tag? This will make all the post with this tag moves to "Untaged" list.`)
        if(confirmDelete){
            axios.delete(`${API_BASE_URL}/api/tags/${tagId}/`,
                { 
                    headers : { Authorization: `Token ${token}`}
                }
            ).then(response => {
                
                setTagList(prevTagList => prevTagList.filter(tag => tag.id !== tagId))

                setSuccess(`"${tagName} "Catergory is deleted successfully..! All the post with this tag moves to "Untaged" list.`)
                timeOutSuccess() 
            }).catch(error => {
                setError(`Error deleting catergory: ${tagName}: ${error}`)
                console.log(`Error deleting catergory: ${tagName}: ${error}`)
            })
        }
    }
    return(
        <div className="category-list container pb-5">
            <h1 className="text-center mt-5 mb-2">Tags <br/> <i className="bi bi-dash-lg"></i></h1>            
            <AddTag onAddTag={handleTagAdd} onFilterChange={setFilterTags} />
            {success && <div className="alert alert-success text-center"><i className="bi bi-check-circle me-1"></i> {success}</div>}
            {error && <div className="alert alert-danger text-center"><i className="bi bi-x-circle me-1"></i> {error}</div>}
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <div className="row">
                    {tagList.filter(category => category.name.toLowerCase().includes(filterTags.toLowerCase())).map(tag => (
                        (tag.name !== 'Untaged') &&
                        <div key={tag.id} className="col-lg-6 col-xl-4 category-div">
                            {editTagId && (editTagId === tag.id)
                            ? 
                                <div className="m-2 d-flex flex-row p-3 edit-category">
                                    <div className="flex-grow-1">
                                    <input className="py-2 form-control" type="text" value={eidtTagName} onChange={(e) => setEditTagName(e.target.value)} />
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-dark mx-1" onClick={() => handleSaveEditClick(tag.id, tag.name)}><i className="bi bi-floppy"></i></button>
                                        <button className="btn btn-dark mx-1" onClick={handleCancelEditClick}><i className="bi bi-x-circle"></i></button>
                                    </div>
                                </div>
                            :     
                                <div className="my-2 fs-5 d-flex flex-row p-3">  
                                    <div className="flex-grow-1">{tag.name}</div>
                                    <div className="text-end">
                                        <span>{tag && token && (userData.id === tag.author) && <button className="btn btn-dark mx-1" onClick={() => handleEditClick(tag && tag.id, tag && tag.name)}><i className="bi bi-pencil-square"></i></button>}</span>
                                        <span>{tag && token && (userData.id === tag.author) && <button className="btn btn-dark mx-1" onClick={() => handleDeleteClick(tag && tag.id, tag && tag.name)}><i className="bi bi-trash3"></i></button>}</span>
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

export default TagList