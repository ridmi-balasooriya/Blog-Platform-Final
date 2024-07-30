import React from 'react';
import { NavLink } from 'react-router-dom';
import { token } from '../components/Auth/Token';
import LogOut from '../components/Auth/LogOut';
const Header = () => {
    return(
        <header className='container-fluid'>
            <nav className='navbar navbar-expand-sm navbar-dark fixed-top shadow'>
                <div className='container'>

                    <img src='https://elasticbeanstalk-eu-west-1-851725255112.s3.amazonaws.com/static/images/tech_talk_logo-dark.png' width="70px" alt='Tech Talk logo' />

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse pt-2" id="navbarToggler">
                        <ul className='navbar-nav ms-auto'>
                            <li className='nav-item'><NavLink to='/' className='nav-link'>Home</NavLink></li>
                            <li className='nav-item'><NavLink to='/articles/' className='nav-link'>Articles</NavLink></li>
                            <li className='nav-item'><NavLink to='/about_us/' className='nav-link'>About Us</NavLink></li>
                            {token && 
                                <li className='nav-item dropdown'>
                                    <a className='nav-link dropdown-toggle' id='navbarDropdown' role='button' data-bs-toggle='dropdown' aria-expanded='false' href='#dropdown'>Account</a>
                                    <ul className='dropdown-menu' aria-labelledby='navbarDropdown'>
                                        <li><NavLink to='/dashboard' className='dropdown-item'>Dashboard</NavLink></li>
                                        <li><NavLink to='/my_profile/' className='dropdown-item'>My Profile</NavLink></li>                                                                         
                                    </ul>                                                         
                                </li> 
                            }
                            {token && <li className='nav-item'><LogOut className='nav-link' /></li>}
                            {!token && <li className='nav-item'><NavLink to='/login' className='nav-link'>Log In</NavLink></li>}
                            {!token && <li className='nav-item'><NavLink to='/register' className='nav-link'>Register</NavLink></li>}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>        
    );
}

export default Header