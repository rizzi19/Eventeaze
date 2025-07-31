import React, { useEffect, useState } from 'react';
import '../styles/ProfileSection.css';
import profilePlaceholder from '../assets/profile-icon.png';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import SuccessPopup from'../components/SuccessPopup';
import { sendVerificationEmailByUsername } from '../components/sendVerifyEmail';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfileSection = ({ username, email, onClose, isVisible }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔍 Fetching profile with:', { username, email });

      if (!username && !email) {
        console.warn('⚠️ No username or email provided!');
        setLoading(false);
        return;
      }

      let query = supabase.from('setup_profiles').select('*');

      if (username) {
        query = query.eq('username', username);
      } else if (email) {
        query = query.eq('email', email);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('❌ Supabase fetch error:', error.message);
      }
  
      if (data) {
        console.log('✅ Profile fetched:', data);
        setUserProfile(data);
        setEditedData(data);
      }

      setLoading(false);
    };

    fetchProfile();

    const fetchVerificationStatus = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('email_verified_or_not')
        .eq('username', username)
        .single();
    
      if (error) {
        console.error('❌ Failed to fetch verification status:', error.message);
      } else {
        const status = data?.email_verified_or_not?.toLowerCase();
        const isVerified = status === 'email verified';
    
        console.log('✅ Email verification status:', status);
        setIsEmailVerified(isVerified);
      }
    };    

    if (username) {
      fetchVerificationStatus();
    }

  }, [username, email]);

  const handleEditClick = (field) => setEditField(field);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    if (!userProfile?.id || !username) return;
  
    // 1. Update setup_profiles table
    const { error: profileError } = await supabase
      .from('setup_profiles')
      .update({ [field]: editedData[field] })
      .eq('id', userProfile.id);
  
    if (profileError) {
      console.error('❌ Error updating setup_profiles:', profileError.message);
      return;
    }
  
    // 2. If updating email, update users table and Supabase Auth
    if (field === 'email') {
      // 2a. Update email in users table using username
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ email: editedData.email })
        .eq('username', username);
  
      if (userUpdateError) {
        console.error('❌ Failed to update email in users table:', userUpdateError.message);
        return;
      }
      
    }   
    // 3. Update local state
    setUserProfile((prev) => ({ ...prev, [field]: editedData[field] }));
    setEditField(null);
  };
    
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleVerifyNow = async () => {
    if (isEmailVerified) {
      toast.success('✅ Email is already verified.');
      return;
    }
  
    const sent = await sendVerificationEmailByUsername(username);
    if (sent) {
      setShowSuccessPopup(true);
    } else {
      toast.error('❌ Failed to send verification email.');
    }
  };
  

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('Logout failed:', error.message);
        return;
      }
  
      // ✅ Clear localStorage and optionally sessionStorage
      localStorage.removeItem('user');
      localStorage.removeItem('locationSelected');
      sessionStorage.clear(); // optional if you're using sessionStorage
  
      window.location.href = '/home';
    } catch (err) {
      console.error('Unexpected logout error:', err);
    }
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="profile-section-overlay visible">
        <div className="profile-header">
          <div className="profile-title-text">Loading Profile...</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-section-overlay visible">
        <div className="profile-header">
          <div className="profile-title-text">Profile not found.</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section-overlay visible">
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px' }}>
           Profile
      </div><br></br>
      <div className="profile-header">
        <div className="profile-title">
          <div>
          <img src={profilePlaceholder} alt="Profile" className="profile-avatar" />
            </div>
          <div className="profile-title-text">
            <div className="greeting-text">
              Hi, {userProfile.username || 'there'} ! 👋
            </div>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className={`email-verification-box ${isEmailVerified ? 'verified' : 'notverified'}`}>
      {isEmailVerified ? (
          <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <FaCheckCircle />
            Email verified
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#d9534f', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExclamationTriangle />
              Email not verified
            </span>
            <button className="verify-btn" onClick={handleVerifyNow}>Verify</button>
      {showSuccessPopup && (
        <SuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}
          </div>
        )}
        </div>



      <div className="profile-info-list">
        {[
          { label: 'Email', field: 'email' },
          { label: 'Full Name', field: 'full_name' },
          { label: 'Company', field: 'company_name' },
          { label: 'City', field: 'city' },
          { label: 'State', field: 'state' },
          { label: 'Zipcode', field: 'zipcode' }
        ].map(({ label, field }) => (
          <div className="profile-row" key={field}>
            <span className="profile-label">{label}:</span>
            {editField === field ? (
              <>
                <input
                  type="text"
                  value={editedData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="editbox"
                />
                <button className="save-btn" onClick={() => handleSave(field)}>Save</button>
              </>
            ) : (
              <>
                <span className="profile-value">{editedData[field] || 'N/A'}</span>
                <button className="edit-btn" onClick={() => handleEditClick(field)}>Edit</button>
              </>
            )}
          </div>
        ))}
        <br></br>
         <div className="profile-actions">
        <button className="publish-btn" onClick={() => navigate('/publish-event')}>
          Publish Event
        </button>
      <button className="logout-btn" onClick={handleLogout}>
        Logout</button>
      </div>
      </div>
    </div>
  );
};

export default ProfileSection;
