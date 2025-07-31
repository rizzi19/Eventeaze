import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SetupProfile.css';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../services/AuthContext';

function SetupProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuth();
  const email = location.state?.email || authUser?.email;
  const username = location.state?.username || authUser?.username;

  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [formData, setFormData] = useState({
    fullName: '',
    email: email || '',
    businessName: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!email || !username) {
      navigate('/login');
      return;
    }

    const checkProfile = async () => {
      const { data, error } = await supabase
        .from('setup_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (data) {
        navigate('/find-events', {
          state: { username, email }
        });
      } else if (error && error.code !== 'PGRST116') {
        console.error('Supabase fetch error:', error.message);
      }
    };

    checkProfile();
  }, [email, username, navigate]);

  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.zipcode && !/^\d{6}$/.test(formData.zipcode))
      newErrors.zipcode = 'Zipcode must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const { fullName, businessName, city, state, zipcode, email } = formData;

    const { error } = await supabase.from('setup_profiles').upsert([
      {
        username,
        full_name: fullName,
        company_name: businessName,
        city,
        state,
        zipcode,
        email,
      },
    ]);

    if (error) {
      showToast('❌ Failed to save profile', false);
      return;
    }

    showToast('✅ Profile saved!');
    navigate('/find-events', {
      state: { username, email }
    });
  };

  const handleSkip = async e => {
    e.preventDefault();
    if (!validate()) return;

    const { fullName, businessName, city, state, zipcode, email } = formData;

    const { error } = await supabase.from('setup_profiles').upsert([
      {
        username,
        full_name: fullName,
        company_name: businessName,
        city,
        state,
        zipcode,
        email,
      },
    ]);

    if (error) {
      showToast('❌ Failed to save profile', false);
      return;
    }

    showToast('✅ Profile saved!');
    navigate('/find-events', {
      state: { username, email }
    });
  };

  return (
    <div className="setup-container">
      <div className="setup-top-curve"></div>
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-heading">
          <h2>Let’s set up your Profile</h2>
          <div className="profile-note">
            Keeping an updated profile helps us deliver accurate results
          </div>
        </div>

        <div className="form-left">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>
          <div className="form-group">
            <label>Email address <span className="required">*</span></label>
            <input type="email" name="email" value={formData.email} disabled />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Business name</label>
            <input
              type="text"
              name="businessName"
              placeholder="John Doe Manufacturing"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            {errors.city && <p className="error-text">{errors.city}</p>}
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Zipcode</label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
            />
            {errors.zipcode && <p className="error-text">{errors.zipcode}</p>}
          </div>
          <div className="form-group note">
            <label style={{ color: '#D53838' }}>
              *You can edit these details later from your Profile Settings page
            </label>
          </div>
        </div>

        <div className="form-submit">
          <button type="submit" className="setup-profile-btn">Save</button>
          <button type="button" className="skip-btn" onClick={handleSkip}>Skip</button>
        </div>
      </form>

      {toast.show && (
        <div className={`toast ${toast.success ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default SetupProfile;
