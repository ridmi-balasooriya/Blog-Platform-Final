import React, {useState, useEffect} from "react";
import axios from "axios";
import DOMPurify from 'dompurify';
import API_BASE_URL from "../../config";
import { useParams, useNavigate, Link } from "react-router-dom";

const BlogListWithCategory = () => {
    const { category_id, category_name } = useParams();
    const [posts, setPosts] = useState(null);
    const [nextPage, setNextPage] = useState([]);
    const [totalPages, setTotalPage] = useState(1)

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/postlist?category_id=${category_id}`)
        .then(response => {
            setPosts(response.data.results)
            setNextPage(response.data.next);
            setTotalPage(Math.ceil(response.data.count/response.data.results.length))
            console.log(response.data)
        })
        .catch(error => {
            console.log(error)
        })
    },[])

    const loadMorePosts = (pageNum) => {
        if (nextPage) {
            axios.get(`${API_BASE_URL}/api/postlist?postlist?category_id=${category_id}`)
            .then(response => {
                setPosts(response.data.results);
            })
            .catch(error => {
                alert(`Error fetching more blog posts: ${error}`);
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
            <h1 className="text-center mt-5 mb-2">{category_name} <br/> <i className="bi bi-dash-lg"></i></h1>
            <div>
                <ul className="row">
                    {posts && posts.map(post => (
                        <li key={post.id} className="article-summary col-12 col-lg-4 col-md-6 d-flex align-items-stretch">
                            <div className="article-summary-div m-2 mb-4 px-4 pt-4 pb-2 d-flex flex-column text-center">
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
                {(totalPages > 1) && 
                    Array.from({ length: totalPages }, (_, index) => (
                        <button className="btn btn-dark pagination-btn" key={index + 1} onClick={() => loadMorePosts(index + 1)}>
                            {index + 1}
                        </button>
                    ))
                }
            </div>
        </div>
    );
}

export default BlogListWithCategory;