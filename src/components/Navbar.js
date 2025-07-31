import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext'; 

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { authUser } = useAuth(); // ✅ Use global user context

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > window.innerHeight * 0.7);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" />
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <div />
          <div />
          <div />
        </div>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="home" smooth duration={500} offset={-70} spy activeClass="active" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="about" smooth duration={500} offset={-70} spy activeClass="active" onClick={() => setMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="contact" smooth duration={500} offset={-70} spy activeClass="active" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li>
            {authUser?.username ? (
              <span style={{ cursor: 'default' }}>
                Hi, {authUser.username}!
              </span>
            ) : (
              <RouterLink to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </RouterLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
