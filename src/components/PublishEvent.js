import React, { useState } from 'react';
import '../styles/PublishEvent.css';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const PublishEvent = () => {
  const [formData, setFormData] = useState({
    event_name: '',
    event_link: '',
    location: '',
    name: '',
    event_date: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('events_published_by_user').insert([formData]);

    if (error) {
      toast.error('❌ Failed to publish event.');
      console.error(error);
    } else {
      toast.success('✅ Event published successfully!');
      setTimeout(() => navigate('/events'), 1500); // go back after toast
    }
  };

  return (
    <div className="publish-container">
      <div className="curve-top"></div>
      <div className="form-wrapper">
        <h2>📢 Publish Your Event</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="event_name" placeholder="Event Name" value={formData.event_name} onChange={handleChange} required />
          <input type="text" name="event_link" placeholder="Event Link (URL)" value={formData.event_link} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
          <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required />
          <button type="submit">Submit</button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default PublishEvent;
