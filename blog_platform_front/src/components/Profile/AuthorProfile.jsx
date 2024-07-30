import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import LoadingSpinner from "../Loading/LoadingSpinner";
import DOMPurify from 'dompurify';

const AuthorProfile = () => {
    const { id } = useParams();
    const [authorProfile, setAuthorProfile] = useState({
        profile_pic: '',
        bio: '',
        first_name: '',
        last_name:''
    });
    const [authorPosts, setAuthorPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isArticleLoading, setIsArticleLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/author_profile/?author=${id}`)
        .then(response => {
            setAuthorProfile(response.data[0])
        }).catch(error => {
            console.log(error)
        })
        .finally(() => {
            setIsLoading(false);
        });

        axios.get(`${API_BASE_URL}/api/postlist?author=${id}`)
        .then(response => {
            setAuthorPosts(response.data.results)
        }).catch(error => {
            console.log(error)
        })
        .finally(() => {
            setIsArticleLoading(false);
        });
    },[id])

    const getPostReadMore = (content) => {
        const words = content.split(' ');
        if (words.length > 50){
            return words.slice(0, 50).join(' ') + '...';
        }else{
            return words.join(' ');
        }
    }

    return(
        <>
        {authorProfile ?
            <div className="container author-profile">
                {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                !authorProfile.first_name 
                    ? <h5 className="not-available">Author Profile is not available.</h5>
                    : <div className="text-center">                        
                        <div className="text-center mt-5">
                            {authorProfile.profile_pic ? 
                                <img src={authorProfile.profile_pic} alt={`${authorProfile.first_name} ${authorProfile.last_name}`} className="d-inline-block m-auto" width='100px' height='100px' />
                                : <div className="author-profile-initial">{authorProfile.first_name.charAt(0).toUpperCase()}</div>
                            }
                        </div>
                        <h1 className="mt-3">{authorProfile.first_name} {authorProfile.last_name}</h1>
                        {authorProfile.profile_pic && <div>{authorProfile.bio}</div>}
                      </div>
                )}
                
                <div className="article-list text-center  mt-5">
                    <h3>Author Articles  <br/> <i className="bi bi-dash-lg"></i></h3>
                    {isArticleLoading ? (
                        <div className="spinner-outer-div">
                            <LoadingSpinner />
                        </div>
                        ) : (
                            <ul className="row">
                                {authorPosts && authorPosts.map(post => (
                                <li key={post.id} className="article-summary col-12 col-lg-4 col-md-6 d-flex align-items-stretch">
                                    <div className="article-summary-div m-2 mb-4 px-4 pt-4 pb-2 d-flex flex-column text-center">
                                        <h5 className="mb-3 fs-6"> 
                                            <a className="category_link" href={`/article_category/${post.category.id}/${post.category.name}`}>
                                                {post.category.name}
                                            </a>
                                        </h5>
                                        <h3 className="mb-3">
                                            <a href={`/posts/${post.author.username}/${post.id}/${post.slug}`}>{post.title}</a>
                                        </h3>
                                        <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostReadMore(post.content)) }} />
                                        <div className="mt-3 mb-5">
                                            <a className="btn btn-dark" href={`/posts/${post.author.username}/${post.id}/${post.slug}`}>Read More</a>
                                        </div>
                                    </div>                            
                                </li>
                                ))}
                            </ul>
                    )}                    
                </div>
            </div>
        :   <div className="not-available">Author Profile is Not Available.!</div>
        }            
        </>
    );
}

export default AuthorProfile;