import React, {useState, useEffect} from "react"
import axios from "axios"
import API_BASE_URL from "../../config"
import { token, userData } from "../Auth/Token"

const Like = ({postId}) => {
    const [likeList, setLikeList] = useState([])
    const [liked, setLiked] = useState({})
    const [formData, setFormData] = useState({
        'post': postId,
    })

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/likes/?postId=${postId}`,  
        {headers: {'Content-Type': 'application/json'}})
        .then(response => {
            const likes = response.data
            setLikeList(likes) 
            userData && setLiked(likes.some(like => like.author.username === userData.username))
        })
        .catch(error => {
            if(error.response && error.response.status === 404){
                setLikeList([])
            }else{
                console.log(`Likes retrieving Error: ${error}`)
            }           
        })
    },[postId, liked])

    const handleLikeSubmission = () => {
        if(liked){
            const likedToDelete = likeList.find(like => like.author.username === userData.username)
            const likedToDeleteId = likedToDelete.id
                        
            axios.delete(`${API_BASE_URL}/api/likes/${likedToDeleteId}/`,
                { 
                    headers : { Authorization: `Token ${token}`}
                }
            ).then(response => {
                setLikeList(prevlikeList => prevlikeList.filter(like => like.id !== likedToDeleteId))
                setLiked(false)
            }).catch(error => {
                console.log(`Error Unliking the Post ${error}`)
            })            
        }else{
            setFormData({
                ...formData,
                'author': userData.id
            })
            axios.post(`${API_BASE_URL}/api/likes/`, formData,
                {headers: {Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',}}
            ).then(response => {
                const newLike = response.data
                setLikeList( [...likeList, newLike])
                userData && setLiked(newLike.author.username === userData.username)               
            })
            .catch(error => {
                console.log(`Error Liking the Post: ${error}`)
            })
        }      
    }

    return(
        <div className="d-inline-block px-2">
            <span>Like(s): </span>
            {(likeList.length > 0) ? <span>{likeList.length}</span> : <span>0</span>} { token  && <button className="btn-thin btn btn-dark ms-1 mb-1" onClick={handleLikeSubmission}> Like{liked && <span>d <i className="bi bi-hand-thumbs-up-fill ms-1"></i></span>}</button>}            
        </div>
    )
}

export default Like
