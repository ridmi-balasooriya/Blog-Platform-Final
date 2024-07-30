import React, { useEffect, useState } from "react";
//import {token} from "../components/Auth/Token";
import Layout from "../templates/Layout";
// import HomeButton from "../components/PageButtons/HomeButton";
// import LogOut from "../components/Auth/LogOut";
import BlogPostForm from "../components/BlogPosts/BlogPostForm";
import MyBlogPost from "../components/BlogPosts/MyBlogPosts";
import CategoryList from "../components/Categories/CategoryList";
import TagList from "../components/Tags/TagList";
import MyProfile from "../components/Profile/MyProfile";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
    const [displayComponent, setDisplayComponent] = useState('create_post');
    const [isMediumSize, setIsMediumSize] = useState(window.innerWidth <= 767);
    const navigate = useNavigate();
    const location = useLocation();
    const postId = new URLSearchParams(location.search).get("postId");
        
    
    useEffect(() => {
        if(postId){
            setDisplayComponent('edit_post');
        }
    },[postId])

    useEffect(() => {
        const handleResize = () => {
          setIsMediumSize(window.innerWidth <= 767);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    
    
    const handleCreatePostClick = () => {
        navigate('/dashboard'); // Navigate to /dashboard
        setDisplayComponent('create_post')
    };
  
    return(
        <Layout>
            {/* {token && <HomeButton /> }
            {token && <LogOut /> } */}
            <div className="dashboard-section container-fluid">
                <div className="row"> 
                    <div className="dashbord-menu-col col-md-3 col-lg-2">
                        <div className={`dashboard_menu ${isMediumSize ? 'dropdown' : ''}`}>

                            {isMediumSize &&
                                <button className="btn btn-secondary dropdown-toggle dashboard_menu_button" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                    Dashboard Menu
                                </button>
                            }
                        
                            <ul className={`dashboard-menu-list mt-5 ${isMediumSize ? 'dropdown-menu' : 'list-group'}`} aria-labelledby="dropdownMenuButton">
                                <li className="list-group-item">
                                    <button className={`btn btn-link fs-5 ${displayComponent === 'create_post' || displayComponent === 'edit_post' ? 'active' : ''}`} onClick={handleCreatePostClick}>
                                        Article Editor <br/> <i className="bi bi-dash-lg"></i>
                                        <span className="dashboard-menu-pointer"></span>
                                    </button>
                                </li>
                                <li className="list-group-item">
                                    <button className={`btn btn-link fs-5 ${displayComponent === 'my_posts' ? 'active' : ''}`} onClick={() => setDisplayComponent('my_posts')}>
                                        My Articles <br/> <i className="bi bi-dash-lg"></i>
                                        <span className="dashboard-menu-pointer"></span>
                                    </button>
                                </li>
                                <li className="list-group-item">
                                    <button className={`btn btn-link fs-5 ${displayComponent === 'category_list' ? 'active' : ''}`} onClick={() => setDisplayComponent('category_list')}>
                                        Categories <br/> <i className="bi bi-dash-lg"></i>
                                        <span className="dashboard-menu-pointer"></span>
                                    </button>
                                </li>
                                <li className="list-group-item">
                                    <button className={`btn btn-link fs-5 ${displayComponent === 'tag_list' ? 'active' : ''}`} onClick={() => setDisplayComponent('tag_list')}>
                                        Tags <br/> <i className="bi bi-dash-lg"></i>
                                        <span className="dashboard-menu-pointer"></span>
                                    </button>
                                </li>
                                <li className="list-group-item">
                                    <button className={`btn btn-link fs-5 ${displayComponent === 'my_profile' ? 'active' : ''}`} onClick={() => setDisplayComponent('my_profile')}>
                                        My Profile <br/> <i className="bi bi-dash-lg"></i>
                                        <span className="dashboard-menu-pointer"></span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="dashboard-col col-md-9 col-lg-10 p-5">
                        <div>
                            {displayComponent === 'create_post' && <BlogPostForm />}
                            {displayComponent === 'edit_post' && <BlogPostForm postId={postId} />}
                            {displayComponent === 'my_posts' && <MyBlogPost />}
                            {displayComponent === 'category_list' && <CategoryList />}
                            {displayComponent === 'tag_list' && <TagList />}
                            {displayComponent === 'my_profile' && <MyProfile />}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>

    )
}

export default DashBoard;