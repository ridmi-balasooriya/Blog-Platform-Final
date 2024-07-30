import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config';
import LoadingSpinner from "../Loading/LoadingSpinner";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from 'react-helmet'
import {token, userData} from "../Auth/Token";
import CommentForm from "../Comments/CommentForm";
import CommentList from "../Comments/CommentList";
import Like from "../Likes/Like";
import Layout from "../../templates/Layout";

const BlogPostFull = () =>{
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        //Get the Post
        axios.get(`${API_BASE_URL}/api/postlist/${id}/`)
        .then((response) => {
            setPost(response.data);
        })
        .catch((error) => {
            error.response.status === 404 ? navigate('/404')
            : console.log(`Error Loading the Post: ${error}`);
        })
        .finally(() => {
            setIsLoading(false);
        });

        //Get Comments related to the post id. ***(Callback when adding new comment)
        axios.get(`${API_BASE_URL}/api/comments/?postId=${id}`,  
            {headers: {'Content-Type': 'application/json'}}
        )
        .then(response => {
            setComments(response.data)
        })
        .catch(error => {
            console.log(`Error fetching comments: ${error}`)
        })

    }, [id, navigate]);

    const handleCommentAdded = (newComment) => {
        setComments([...comments, newComment])
    }
    
    const handleEditClick = (postId) => {
        navigate(`/dashboard/?postId=${postId}`)
    }

    const handleDeleteClick = (postId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?')

        if(confirmDelete){
            axios.delete(
                `${API_BASE_URL}/api/posts/${postId}/`,
                { headers : { Authorization: `Token ${token}`}}
            ).then(response => {
                alert(`Your blog post is deleted successfully..!`)
                navigate(`/`)
                console.log(`Post ${postId} deleted successfully`);
            }).catch(error => {
                console.log(`Error deleting post ${postId}: ${error}`)
            })
        }
    }

    const handleIsPublic = (postId, isPublic) => {
        axios.put(`${API_BASE_URL}/api/posts/${postId}/`, {is_public: !isPublic, slug: post.slug},
            { headers : { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data',}}
        ).then(response => {
            setPost(response.data);
        }).catch(error => {
            console.log(`Error changing post status ${postId}: ${error}`)
        })
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
        const monthIndex = date.getMonth()
        const monthName = monthNames[monthIndex]
        return `${monthName} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    }

    
    return( 
        <Layout>  
            <Helmet>
                <meta name="description" content={post && post.meta_description} />
            </Helmet>  
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <article className="article container">
                    {post && post.image && 
                        <div className="post_image">
                            {post && <img src={`${post.image}`} alt={post.title} /> }
                        </div>
                    }                 
                    <div className="text-center pt-5">
                        <a className="category_link fs-4" href={`/article_category/${post && post.category.id}/${post && post.category.name}`}>
                            {post && post.category.name}
                        </a>
                    </div>
                    <h1 className="text-center">{post && post.title}  <br/> <i className="bi bi-dash-lg"></i></h1>
                    <div className="text-center mb-2">
                        {post && post.tags.map((tag, index) => 
                        <span className="badge tag-badge mx-1 mb-1 p-2 d-inline-block" key={tag.name}> {tag.name} </span> )}
                    </div>  
                    <div className="author-div text-center text-md-end mb-4 color-subfont">                    
                        <span className="d-inline-block px-2">
                            <strong>
                            <Link to={`/author/${post && post.author.id}`}>
                                {post && post.author_profile.author.first_name} {post && post.author_profile.author.last_name}
                            </Link> - {post && formatDate(post.updated_at)}
                            </strong>
                        </span>
                        <strong>| {post && <Like postId={post.id} />}</strong>
                    </div>
    
                    <div className="my-4 text-end">
                        {post && token && (userData.username === post.author.username) && <button className="btn btn-dark mx-1" onClick={() => handleEditClick(post && post.id)}><i className="bi bi-pencil-square"></i></button> }
                        {post && token && (userData.username === post.author.username) && <button className="btn btn-dark mx-1" onClick={() => handleDeleteClick(post && post.id)}><i className="bi bi-trash3"></i></button> }
                        {
                            post && token && (userData.username === post.author.username) && 
                            <button className="btn btn-dark mx-1" onClick={() => handleIsPublic(post && post.id, post && post.is_public)}>
                                {post && post.is_public ? <span>Public <i className="bi bi-globe ms-1"></i></span> : <span>Draft <i className="bi bi-eye-slash-fill ms-1"></i></span>}
                            </button> 
                        }
                    </div>    
                              
                    <div className="article-content">
                        {post &&  <p dangerouslySetInnerHTML={{ __html: post.content }} />}
                    </div>
                    <a href='/articles/' className="d-block mb-5">Back To Article List</a>
                    {post && token && <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} /> }
                    {post && <CommentList postId={post.id} onCommentAdded={handleCommentAdded} /> }
                </article>
                )}            
        </Layout>   
    )


}

export default BlogPostFull;