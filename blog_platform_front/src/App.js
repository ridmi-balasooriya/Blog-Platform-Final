import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlesPage';
import ArticlesWithCategory from './pages/ArticlesWithCategoryPage';
import AboutUsPage from './pages/AboutUsPage';
import BlogPostFull from './components/BlogPosts/BlogPostFull';
import AuthorProfilePage from './pages/AuthorProfilePage';
import ProfilePage from './pages/ProfilePage';
import LogIn from './components/Auth/LogIn'
import Register from './components/Auth/Register';
import PasswordReset from './components/Auth/PasswordRest';
import PasswordResetConfirmation from './components/Auth/PasswordResetConfirmation';
import DashBoard from './pages/DashBoard';
import NotFound from './pages/NotFound';
import PrivateRoutes from './components/Auth/PrivateRoutes';
import {token} from './components/Auth/Token';

function App() {
  const isAuthorized = !!token

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/articles/' element={<ArticlePage />} />
        <Route path='/about_us/' element={<AboutUsPage />} />
        <Route path='/article_category/:category_id/:category_name' element={<ArticlesWithCategory />} />
        <Route path="/dashboard/" element={<PrivateRoutes authenticated={isAuthorized} children={<DashBoard />} />} />   
        <Route path='posts/:usernanme/:id/:slug' element={<BlogPostFull />} />
        <Route path='author/:id' element={<AuthorProfilePage />} />
        <Route path='my_profile/' element={<ProfilePage />} />
        <Route path='register' element={<Register />} />
        <Route path='password_reset' element={<PasswordReset />} />
        <Route path='password_reset_confirm/:uid/:token' element={<PasswordResetConfirmation />} />
        <Route path='login' element={localStorage.getItem('token') ? (<Navigate to="/" />) : (<LogIn />)} />

         {/* Handle 404 explicitly */}
        <Route path='*' element={<NotFound/>} />
      </Routes>        
    </Router>
  );
}

export default App;
