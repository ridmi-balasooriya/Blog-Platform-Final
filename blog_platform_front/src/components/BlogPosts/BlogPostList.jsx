import React, { useState, useEffect} from "react";
import axios from "axios";
import DOMPurify from 'dompurify';
import API_BASE_URL from '../../config';
import LoadingSpinner from "../Loading/LoadingSpinner";
import { useParams, Link } from 'react-router-dom';

const BlogPostList = () => {
    const [posts, setPosts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPage, setNextPage] = useState([]);
    const [totalPages, setTotalPage] = useState(1)
    const { successMsg } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/postlist?search=${searchInput}&type=${searchType}`)
        .then(response => {
            setPosts(response.data.results)
            setNextPage(response.data.next);
            setTotalPage(Math.ceil(response.data.count/response.data.results.length))
        })
        .catch(error => {
            alert(`Error fetching blog posts:
            ${error}`);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [searchInput, searchType])

   
    const loadMorePosts = (pageNum) => {
        if (nextPage) {
            setIsLoading(true)
            axios.get(`${API_BASE_URL}/api/postlist?page=${pageNum}&search=${searchInput}&type=${searchType}`)
            .then(response => {
                setPosts(response.data.results);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
        const monthIndex = date.getMonth()
        const monthName = monthNames[monthIndex]
        return `${monthName} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    }

    return(
        <div className="article-list container pb-5">
            <div className="post_image image-dark">
                <img src="https://elasticbeanstalk-eu-west-1-851725255112.s3.amazonaws.com/static/images/article-list-top-banner.jpg" alt="Article List Page" className="image-fluid" />
            </div>
            <h1 className="text-center mt-5 mb-2">Articles <br/> <i className="bi bi-dash-lg"></i></h1>
            <div className="search-section d-flex flex-row pb-5">
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
           
            {successMsg && <div>{successMsg}</div>}
            <div>
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <ul className="row">
                    {posts.map(post => (
                        <li key={post.id} className="article-summary col-12 col-lg-4 col-md-6 d-flex align-items-stretch">
                            <div className="article-summary-div m-2 mb-4 px-4 pt-4 pb-2 d-flex flex-column text-center">
                                <h5 className="mb-3 fs-6"> 
                                    <a className="category_link" href={`/article_category/${post.category.id}/${post.category.name}`}>
                                        {post.category.name}
                                    </a>
                                </h5>
                                <h3 className="mb-3"><a href={`/posts/${post.author.username}/${post.id}/${post.slug}`}>{post.title}</a> <br/> <i className="bi bi-dash-lg"></i></h3>
                                <p className="text-break" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostReadMore(post.content)) }} />
                                <div className="mb-3 mt-0">
                                    {post && post.tags.map((tag) => 
                                    <span className="badge tag-badge mx-1" key={tag.name}> {tag.name} </span> )}
                                </div>
                                <div className="mt-3 mb-5">
                                    <a className="btn btn-dark" href={`/posts/${post.author.username}/${post.id}/${post.slug}`}>Read More</a>
                                </div>
                                <div className="text- center text-sm-end author-block mt-sm-auto">
                                    {
                                        (post.author_profile && post.author_profile.profile_pic)
                                        ? <img src={post.author_profile.profile_pic} alt={post.author.username} className="me-2" width='30px' height='30px' />
                                        : <span className="author-profile-initial me-2">{post.author.username.charAt(0).toUpperCase()}</span>                                
                                    }
                                    
                                    <Link to={`/author/${post && post.author.id}`}>
                                        {post && post.author_profile.author.first_name} {post && post.author_profile.author.last_name}
                                    </Link> - {post && formatDate(post.updated_at)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                )}
                
                {(totalPages > 1) && 
                    Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn btn-dark pagination-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => loadMorePosts(index + 1)}>
                            {index + 1}
                        </button>
                    ))
                }
            </div>            
        </div>
    )
}

export default BlogPostList;