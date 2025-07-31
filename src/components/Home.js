import React from 'react';
import '../styles/Home.css';
import AboutUs from './AboutUs';
import EventSlider from './EventSlider';
import ContactUs from './ContactUs';
import Navbar from './Navbar';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext'; 

function Home() {
  const { authUser } = useAuth(); // ✅ Get the logged-in user

  return (
    <>
      <Navbar />

      {/* Home Hero */}
      <section className="home-section" id="home">
        <div className="home-content">
          <h1>Simplified Event Search and Registration for Small Business</h1>

          {authUser?.username ? (
            <RouterLink
              to="/events"
              state={{ username: authUser.username, email: authUser.email }}
              style={{ textDecoration: 'none' }}
            >
              <button>My Events</button>
            </RouterLink>
          ) : (
            <RouterLink to="/signup" style={{ textDecoration: 'none' }}>
              <button>Get Started</button>
            </RouterLink>
          )}
        </div>
      </section>

      <EventSlider />
      <AboutUs />
      <ContactUs />

      <footer className="footer">
  © 2025 <span className="brand"> EventEaze</span>. All rights reserved. Developed by {' '}
  <a href="https://diligentcreations.web.app/" className="dev-name" target="_blank" rel="noopener noreferrer">
    Diligient Creations
  </a>.
</footer>
    </>
  );
}

export default Home;
