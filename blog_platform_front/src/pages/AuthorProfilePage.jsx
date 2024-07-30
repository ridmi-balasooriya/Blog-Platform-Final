import React from "react";
import Layout from '../templates/Layout';
import AuthorProfile from '../components/Profile/AuthorProfile';

const AuthorProfilePage = () => {
    return(
        <Layout>
            <AuthorProfile />
        </Layout>
    );
}

export default AuthorProfilePage;