import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import {token, userData} from "../Auth/Token";

const TagList = () => {
    const [tagList, setTagList] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        author: userData.id,
    })
    const [editTagId, setEditTagId] = useState(null)
    const [eidtTagName, setEditTagName] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] =useState('')

    // Get Tag List
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/tags`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(response => {
            console.log(response.data)
            setTagList(response.data)
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

    //Check for already Existing Tag
    const alreadyExisit = (tagName) => {
        const isNameAlreadyExist = tagList.some(tag => 
            tag.name.toLowerCase() === tagName.toLowerCase()
        );
        
        console.log("isNameAlreadyExist:", isNameAlreadyExist);
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

    //Add New Tag
    const handleNewTag = (e) => {
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
            axios.post(`${API_BASE_URL}/api/tags/`, 
                formData, 
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            )
            .then(response => {
                setTagList([...tagList, response.data])
                setFormData({
                    name: '',
                    author: userData.id,
                })
                setSuccess('New Tag is Added Successfully..!')
                timeOutSuccess() 
            })
            .catch(error => {
                setError(`Error Adding New Tag: ${error}`)
            })
        }   
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
            axios.delete(`${API_BASE_URL}/api/tags/${tagId}`,
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
        <div>
            <h1>Tags</h1>
            {success && <div>{success}</div>}
            {error && <div>{error}</div>}
            <form onSubmit={handleSubmission}>
                <input type="text" name="name" value={formData.name} onChange={handleNewTag} />
                <button type="submit">Add New Tag</button>
            </form>
            <ul>
                {tagList.map(tag => (
                    (tag.name !== 'Untaged') &&
                    <li key={tag.id}>
                        {editTagId && (editTagId === tag.id)
                        ? 
                            <div>
                                <input type="text" value={eidtTagName} onChange={(e) => setEditTagName(e.target.value)} />
                                <button onClick={() => handleSaveEditClick(tag.id, tag.name)}>Save</button>
                                <button onClick={handleCancelEditClick}>Cancel</button>
                            </div>
                        :     
                            <div>                      
                                <span>{tag.name}</span>
                                <span>{tag && token && (userData.id === tag.author) && <button onClick={() => handleEditClick(tag && tag.id, tag && tag.name)}>Edit</button>}</span>
                                <span>{tag && token && (userData.id === tag.author) && <button onClick={() => handleDeleteClick(tag && tag.id, tag && tag.name)}>Delete</button>}</span>
                            </div>
                        }                        
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TagList