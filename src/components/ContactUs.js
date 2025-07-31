import React from 'react';
import '../styles/ContactUs.css';

const ContactUs = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        {/* LEFT: Contact Info */}
        <div className="contact-info">
          <h2>Contact Us</h2>
          <p>Have questions or want to collaborate?</p>
          <p>
            <strong>Email:</strong>{' '}<br></br>
            <a href="mailto:support@eventeaze.app" className="email-link">
            support@eventeaze.app
            </a>
          </p>
        </div>

        {/* RIGHT: Optional Form (Can be uncommented if needed later) */}
        
        <div className="contact-form">
          <h3>Send a Message</h3>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
        
      </div>

    </section>
  );
};

export default ContactUs;
