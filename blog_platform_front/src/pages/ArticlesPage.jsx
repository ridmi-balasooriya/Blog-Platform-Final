import React from "react";
import Layout from "../templates/Layout";
import BlogPostList from "../components/BlogPosts/BlogPostList"

const ArticlePage = () => {
    return(
        <Layout>
            <BlogPostList />
        </Layout>
    );
}

export default ArticlePage;