import React from 'react';
import '../styles/About.css';
import aboutImage from '../assets/about.jpg';

const AboutUs = () => {
  return (
    <section className="about-page" id="about">
      <div className="about-content">
        <div className="about-text">
          <h2>About Us</h2>
          <p>
            EventEaze is your one-stop platform dedicated to simplifying event registration and exhibiting for small businesses. Whether you're a homegrown brand, a local creator, or a budding entrepreneur, we help you find the perfect events to showcase your work with ease.
          </p>
          <p>
            From discovering the right pop-ups and exhibitions to registering seamlessly and managing your bookings — EventEaze takes the hassle out of the process so you can focus on what you do best. Join us in making event participation smoother, smarter, and stress-free.
          </p>
        </div>

        <div className="about-image-wrapper">
          <img src={aboutImage} alt="About Us" />
          <div className="image-tint"></div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
