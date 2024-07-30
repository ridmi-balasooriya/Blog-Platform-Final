import React, {useState, useEffect} from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import LoadingSpinner from "../Loading/LoadingSpinner";
import DOMPurify from 'dompurify';

const RecentBlogPosts = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/recentposts`)
        .then(response => {
            setRecentPosts(response.data)
        })
        .catch(error => {
            console.log(error)
        })
        .finally(() => {
            setIsLoading(false);
        });
    },[])

    const getPostReadMore = (content) => {
        const words = content.split(' ');
        if (words.length > 50){
            return words.slice(0, 20).join(' ') + '...';
        }else{
            return words.join(' ');
        }
    }

    return(
        <div className="recent-article container-fluid pb-5 mb-5" style={{backgroundImage: `url(https://elasticbeanstalk-eu-west-1-851725255112.s3.amazonaws.com/static/images/recent-article-bg.jpg)`}}>
            <div className="recent-article-overlay"></div>
            <div className="recent-article-content container">
                <h2 className="text-center py-5">Recent Articles <br/> <i className="bi bi-dash-lg"></i></h2>
                {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <div className="row justify-content-center">
                    {recentPosts.map(post => (
                        <div className="col-lg-3 col-md-6 d-flex align-items-stretch text-center" key={post.id}>
                            <div className="card border-0 mb-3">
                                <img src={`${post.image}`} className="card-img-top" alt={post.title} height='170px' />
                                <div className="card-body">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostReadMore(post.content)) }} />                                                                        
                                </div>
                                <div className="card-overlay">
                                    <span className="d-flex flex-column align-items-center p-2">  
                                        <span className="mb-0 fs-6">{post && post.category.name}</span>
                                        <h4 className="card-title mt-2 mb-4">{post.title}</h4> 
                                        <a  href={`/posts/${post.author.username}/${post.id}/${post.slug}`} className="btn btn-light stretched-link mb-4">Read Article</a>
                                        <div className="mb-auto">
                                            {post && post.tags.map((tag) => 
                                            <span className="badge tag-badge mx-1" key={tag.name}> {tag.name} </span> )}
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}   
                </div>
                )}
            </div>                        
        </div>
    );
}

export default RecentBlogPosts;