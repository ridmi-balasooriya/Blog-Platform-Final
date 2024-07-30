import React from "react";
import Layout from "../templates/Layout";
const NotFound = () => {
    return(
        <Layout>
            <article className="container text-center">
                <div className="post_image image-dark">
                    <img src="https://elasticbeanstalk-eu-west-1-851725255112.s3.amazonaws.com/static/images/page-not-found-top-banner.jpg" alt="Page Not Found - 404" className="image-fluid" />
                </div>
                <h1 className="mt-5">Page Not Found <br/> <i className="bi bi-dash-lg"></i></h1>
                <p>The requested page could not be found.</p>
                </article>
        </Layout>
    );
}

export default NotFound