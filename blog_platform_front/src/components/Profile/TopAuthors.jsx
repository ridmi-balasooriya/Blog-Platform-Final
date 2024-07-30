import React, {useState, useEffect} from "react";   
import axios from "axios";
import API_BASE_URL from "../../config";
import LoadingSpinner from "../Loading/LoadingSpinner";

const TopAuthors = () => {
    const [topAuthors, setTopAuthors] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/top_authors`)
        .then(response => {
            const topAuthorIds = response.data.map(author => author.id);
            if (topAuthorIds.length) {
                const top_authors = `author_ids=${topAuthorIds.join(',')}`;
                return axios.get(`${API_BASE_URL}/api/author_profile/?${top_authors}`);
            } else {
                throw new Error("No top authors found");
            }
        })
        .then(response => {
            if (response.headers['content-type'].includes('application/json')) {
                setTopAuthors(response.data);
            } else {
                throw new Error("Invalid response format");
            }
        })
        .catch(error => {
            console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    },
    [])
    return(
        <div className="top-author text-center">
            <h3>Top Authors <br/> <i className="bi bi-dash-lg"></i></h3> 
            {isLoading ? (
                <div className="spinner-outer-div">
                    <LoadingSpinner />
                </div>
                ) : (
                <div id="topAuthorsCarousel" className="carousel slide light-carousel" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        {topAuthors && topAuthors.map((topAuthor, index) => (
                            <button 
                                key={topAuthor.author.id} 
                                type="button" 
                                data-bs-target="#topAuthorsCarousel" 
                                data-bs-slide-to={index} 
                                className={index === 0 ? 'active' : ''} 
                                aria-current={index === 0 ? 'true' : ''} 
                                aria-label={`Slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>
    
                    <div className="carousel-inner">
                        {topAuthors && topAuthors.map((topAuthor, index) => (
                            <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={topAuthor.author.id}>
                                {topAuthor.profile_pic 
                                    ? <img src={`${topAuthor.profile_pic}`} className="d-block dark-image mx-auto mb-4" alt={topAuthor.author.username} height='80px' width='80px' />
                                    : <div className="author-profile-initial rounded fs-1 mx-auto mb-4">{topAuthor.author.username.charAt(0)}</div>
    
                                }
                                
                                <div className="d-md-block px-md-5 px-2">      
                                    <h3 className="mb-4">{topAuthor.first_name} {topAuthor.last_name}</h3>
                                    <p>
                                        Meet the masterminds behind the cutting-edge discussions and insightful analyses on our tech blog. These top authors stand out for their prolific contributions, diving deep into the latest trends, technologies, and innovations that are shaping the future. Join us in celebrating the voices that drive progress and foster a deeper understanding of the digital world.
                                    </p>
                                    <a  href={`/author/${topAuthor.author.id}`} className="btn btn-dark stretched-link mb-5">Learn More</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>  
            )}
        </div>
    )
}

export default TopAuthors;