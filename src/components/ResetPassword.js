import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import '../styles/Auth.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleBackToLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (loading) return;
    setMessage({ text: '', type: '' });

    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const { data: user, error } = await supabase
        .from('users')
        .select('reset_password_token')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (!user || !user.reset_password_token) {
        setMessage({ text: 'Email not found or reset token missing', type: 'error' });
        setLoading(false);
        return;
      }

      const resetUrl = `https://eventeaze.app/reset.html?token=${user.reset_password_token}`;

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_hru4ydu',
          template_id: 'template_0q1hij9',
          user_id: '8vaLWAd4SXHWReibL',
          template_params: {
            user_email: email,
            reset_link: resetUrl,
          },
        }),
      });

      if (response.status === 200) {
        setMessage({ text: 'Reset email sent successfully!', type: 'success' });
        setEmail('');
      } else {
        setMessage({ text: 'Failed to send reset email', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `An error occurred: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Reset Your Password</h2>

        <p style={{ marginTop: '0', marginBottom: '20px' }}>
          Enter your email address below to receive your <br />
          password reset link
        </p>

        <form>
          <label>Email address</label>
          <input
            type="email"
            placeholder="johndoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>

          {message.text && (
            <p
              style={{
                color: message.type === 'success' ? 'green' : 'red',
                marginTop: '15px',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {message.text}
            </p>
          )}

          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            <a
              href="/login"
              onClick={handleBackToLogin}
              title="Go to Login page"
              style={{
                color: '#D53838',
                textDecoration: 'none',
                fontFamily: 'Product Sans',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ← Back to Login
            </a>
          </p>
        </form>
      </div>

      <div className="logo-bottom">EventEaze ⭮</div>
    </div>
  );
}

export default ResetPassword;
