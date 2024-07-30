import Layout from '../templates/Layout';
import FeaturedPost from '../components/BlogPosts/FeaturedPost';
import RecentBlogPosts from '../components/BlogPosts/RecentBlogPosts';
import PopularTopics from '../components/BlogPosts/PopularTopics';
import TopAuthors from '../components/Profile/TopAuthors';

const HomePage = () => {
    return(
        <Layout>
            <FeaturedPost />
            <div className='welcome-content container d-flex flex-column justify-content-center mb-5'>
                <span className='d-block mx-auto mb-3'>
                    <img src="https://elasticbeanstalk-eu-west-1-851725255112.s3.amazonaws.com/static/images/tech_talk_logo_light.png" alt='Tech Talk Logo' width='200px' />
                </span>
                <h1 className='text-center'>Welcome to Tech Talk <br/> <i className="bi bi-dash-lg"></i></h1>
                <p className='text-center fs-5'>
                    Tech Talk is the dynamic hub for enthusiasts of computer science and technology. Our platform is not just about exploring the latest trends and innovations; it's a community where tech aficionados can read, write, and share their insights. Whether you're a professional, a student, or simply a tech lover, Tech Talk offers a space to engage with a diverse range of topics, from AI and cybersecurity to software development. Join us in shaping the conversation about technology's future – your voice matters here. Let's dive into the world of tech together at Tech Talk!
                </p>
            </div>

            <RecentBlogPosts />

            <div className='container-fluid pb-5'>
                <div className='container'>
                    <div className='row'>
                    <div className='col-md-6'><PopularTopics /></div>
                    <div className='col-md-6'><TopAuthors /></div>
                    </div>
                </div>                
            </div>

        </Layout>
    )
}


export default HomePage;