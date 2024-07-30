import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return(
        <footer className='container-fluid text-center p-4 pt-3'>
            <div className='container'>
                <ul className='footer-nav navbar'>
                    <li className='nav-item'><NavLink to='/' className='nav-link'>Home</NavLink></li> | 
                    <li className='nav-item'><NavLink to='/articles/' className='nav-link'>Articles</NavLink></li> |  
                    <li className='nav-item'><NavLink to='/about_us/' className='nav-link'>About Us</NavLink></li>
                </ul>
            </div>
             <p className='fs-6'>&copy; {currentYear} Tech Talk. All rights reserved. | Designed and developed by Ridmi Balasooriya | This blog platform serves as a showcase of my technical skills and is created solely for demonstration purposes.</p>
        </footer>
    );
}

export default Footer;