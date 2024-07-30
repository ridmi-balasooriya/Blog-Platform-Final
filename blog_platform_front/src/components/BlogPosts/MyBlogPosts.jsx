import { useState, useEffect } from "react"
import axios from "axios"
import API_BASE_URL from "../../config"
import LoadingSpinner from "../Loading/LoadingSpinner";
import { token } from "../Auth/Token"
import DOMPurify from 'dompurify';

const MyBlogPost = () => {
    const [blogPosts, setBlogPost] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [nextPage, setNextPage] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPage] = useState(1)
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const timeOutSuccess = (time = 5000) => {
        setTimeout(() => {
            setSuccessMsg('');
        }, time);
    }
    
    useEffect(() => {
        if(token){
            axios.get(`${API_BASE_URL}/api/my_posts/?search=${searchInput}&type=${searchType}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                setBlogPost(response.data.results)
                setNextPage(response.data.next);
                setTotalPage(Math.ceil(response.data.count/response.data.results.length))
            })
            .catch(error => {
                console.log(`Error fetching user-specific blog posts: ${error}`)
                alert(`Error fetching user-specific blog posts: ${error}`)
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    },[searchInput, searchType]);

    const loadMorePosts = (pageNum) => {
        if (nextPage) {
            setIsLoading(true);
            axios.get(`${API_BASE_URL}/api/my_posts/?page=${pageNum}&search=${searchInput}&type=${searchType}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                setBlogPost(response.data.results);
                setCurrentPage(pageNum)
            })
            .catch(error => {
                alert(`Error fetching more blog posts: ${error}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    };

    const getPostReadMore = (content) => {
        const words = content.split(' ');
        if (words.length > 50){
            return words.slice(0, 50).join(' ') + '...';
        }else{
            return words.join(' ');
        }
    }

    const handleUpdateClick = (postId) => {
        //Send for dashboad form create/update panel to do the update.
        window.location.href = `/dashboard?postId=${postId}`;
    };

    const handleDeleteClick = (postId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?')

        if(confirmDelete){
            axios.delete(
                `${API_BASE_URL}/api/posts/${postId}/`,
                { headers : { Authorization: `Token ${token}`}}
            ).then(response => {
                setSuccessMsg('Your blog post is deleted successfully..!')
                setBlogPost(
                    prevPosts => prevPosts.filter(post => post.id !== postId )
                )
                console.log(`Post ${postId} deleted successfully`);
                timeOutSuccess()
            }).catch(error => {
                console.log(`Error deleting post ${postId}: ${error}`)
            })
        }
    }

    return(
        <div className="article-list container pb-5">
            <h1 className="text-center mt-5 mb-2">My Articles <br/> <i className="bi bi-dash-lg"></i></h1>
            <div className="search-section d-flex flex-row pb-3">
                <div className="search-type">
                    <select name="search_type" className="form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)} aria-label="search_type">
                        <option value='title'>Title</option>
                        <option value='category'>Category</option>
                    </select>
                </div>
                <div className="search-input input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        name="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        aria-label="Search"
                    />
                    <div className="input-group-append">
                        <span className="input-group-text" id="basic-addon2">
                        <i className="bi bi-search"></i>
                        </span>
                    </div>
                </div>
                
            </div>
            {successMsg && <div className="alert alert-success text-center"><i className="bi bi-check-circle me-1"></i> {successMsg}</div>}
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <ul>
                    {blogPosts.map(post => (
                        <li key={post.id} className="my-article p-4 mt-3 mb-4">
                            <div className="text-end">
                                <button className="btn btn-dark mx-1" onClick={() => handleUpdateClick(post.id)}><i className="bi bi-pencil-square"></i></button>
                                <button className="btn btn-dark mx-1" onClick={() => handleDeleteClick(post.id)}><i className="bi bi-trash3"></i></button>
                            </div>
                            <h5 className="mt-4 mt-md-0">{post.category.name}</h5>
                            <h2 className="mb-1"><a href={`/posts/${post.author.username}/${post.id}/${post.slug}`} target="_blank" rel="noopener noreferrer">{post.title}  <br/> <i className="bi bi-dash-lg"></i></a></h2>
                            <div className="mb-3 mt-0">
                                {post && post.tags.map((tag) => 
                                <span className="badge tag-badge mx-1" key={tag.name}> {tag.name} </span> )}
                            </div>
                            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostReadMore(post.content)) }} />
                            <a className="btn btn-dark" href={`/posts/${post.author.username}/${post.id}/${post.slug}`} target="_blank" rel="noopener noreferrer">Read More</a>
                        </li>
                    ))}
                </ul>
            )}
            
            {(totalPages > 1) && 
                Array.from({ length: totalPages }, (_, index) => (
                    <button className={`btn btn-dark pagination-btn ${currentPage === index + 1 ? 'active' : ''}`} key={index + 1} onClick={() => loadMorePosts(index + 1)}>
                        {index + 1}
                    </button>
                ))
            }
        </div>
    );
}

export default MyBlogPost