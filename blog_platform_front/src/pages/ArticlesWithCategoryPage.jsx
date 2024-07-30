import React from "react"
import Layout from "../templates/Layout"
import BlogListWithCategory from "../components/BlogPosts/BlogListWithCategory"

const ArticlesWithCategory = () => {
    return(
        <Layout>
            <BlogListWithCategory />
        </Layout>
    )
}

export default ArticlesWithCategory
