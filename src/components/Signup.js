// Signup.js
import React, { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { auth, provider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import '../styles/signup.css';
import '../styles/SuccessPopup.css';
import SuccessPopup from'../components/SuccessPopup';
import googleLogo from '../assets/google logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { sendVerificationEmail } from '../components/sendVerifyEmail';
import { useAuth } from '../services/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempUsername, setTempUsername] = useState('');

  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
  };

  const validateEmail = (email) => {
    const regex = /^[^@]+@[^@]+\.[^@]+$/;
    return !regex.test(email) ? 'Please enter a valid email' : '';
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    const strong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/;
    return !strong.test(password) ? 'Must include letters, numbers & symbols' : '';
  };

  const validateUsername = (username) => {
    const regex = /^(?!.*[._]{2})[a-zA-Z][a-zA-Z0-9._]{2,19}(?<![._])$/;
  
    // Check both regex and space
    if (!regex.test(username)) {
      return 'Username must be 3-20 chars, no special characters, no space';
    }
  
    return '';
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emailErr = validateEmail(email);
    if (emailErr) return showToast(`❌ ${emailErr}`, false);
  
    const passErr = validatePassword(password);
    if (passErr) return showToast(`❌ ${passErr}`, false);
  
    const usernameErr = validateUsername(username);
    if (usernameErr) return showToast(`❌ ${usernameErr}`, false);
  
    if (password !== repeatPassword)
      return showToast('❌ Passwords do not match', false);
  
    try {
      // 1. Sign up user using Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (signUpError) {
        showToast(`❌ ${signUpError.message}`, false);
        return;
      }
  
      const authUser = signUpData?.user;
      if (!authUser) {
        showToast('❌ Auth failed to return user info', false);
        return;
      }
  
      // 2. Insert into your custom users table
      const reset_token = uuidv4();
      const verify_email_token = uuidv4();
      const email_verified_or_not = 'Email not verified';
  
      const { error: insertError } = await supabase.from('users').insert([
        {
          auth_id: authUser.id, // ✅ Use UUID here
          email,
          username,
          password, 
          reset_password_token: reset_token,
          verify_email_token,
          email_verified_or_not,
        },
      ]);
  
      if (insertError) {
        showToast(`❌ DB error: ${insertError.message}`, false);
        return;
      }
  
      // 3. Finalize
      setAuthUser({
        auth_id: authUser.id,
        email,
        username,
        password,
        reset_password_token: reset_token,
        verify_email_token,
        email_verified_or_not,
      });

      showToast('🎉 Signup successful!');
      setTempToken(verify_email_token);
      setTempEmail(email);
      setTempUsername(username);
      setShowVerifyPopup(true);
  
      setEmail('');
      setUsername('');
      setPassword('');
      setRepeatPassword('');
    } catch (err) {
      console.error(err);
      showToast('🔥 Server error. Please try again.', false);
    }
  };
  

  const handleGoogleSignup = async () => {
    try {
      await auth.signOut();
      provider.setCustomParameters({ prompt: 'select_account' });
  
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;
      const username = user.displayName || 'User';
      const verify_email_token = uuidv4();
      const email_verified_or_not = 'Email not verified';
  
      const session = await supabase.auth.getSession();
      const authUser = session.data?.session?.user;
  
      if (!authUser) {
        showToast('❌ Auth failed to return user info', false);
        return;
      }
  
      // Check if user already exists in custom 'users' table using auth_id
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();
  
      if (existingError && existingError.code !== 'PGRST116') {
        // some other unexpected DB error
        showToast(`❌ Supabase error: ${existingError.message}`, false);
        return;
      }
  
      if (!existingUser) {
        // Insert new user using auth_id (UUID) and auto-generated serial id
        const { error: insertError } = await supabase.from('users').insert([
          {
            auth_id: authUser.id, // ✅ UUID for linking with Supabase Auth
            email,
            username,
            password: 'google-account', // placeholder
            reset_password_token: 'google_reset_token',
            verify_email_token,
            email_verified_or_not,
          },
        ]);
  
        if (insertError) {
          showToast(`❌ Supabase error: ${insertError.message}`, false);
          return;
        }
      }
  
      // Continue to verification screen
      setAuthUser({
        auth_id: authUser.id,
        email,
        username,
        password: 'google-account', // placeholder
        reset_password_token: 'google_reset_token',
        verify_email_token,
        email_verified_or_not,
      });

      setTempToken(verify_email_token);
      setTempEmail(email);
      setTempUsername(username);
      setShowVerifyPopup(true);
    } catch (err) {
      console.error('Google Sign-Up Error:', err);
      showToast('❌ Google Sign-Up failed.', false);
    }
  };
  
  
  const handleVerifyNow = async () => {
    const sent = await sendVerificationEmail(tempEmail, tempToken);
    if (sent) {
      setShowSuccessPopup(true);
      setShowVerifyPopup(false);
    } else {
      showToast('❌ Failed to send verification email', false);
    }
  };
  
  

  const handleVerifyLater = () => {
    setShowVerifyPopup(false);
    showToast('⚠️ You can verify your email later in Profile tab');
    setTimeout(() => {
      navigate('/setup-profile', {
        state: {
          email: tempEmail,
          username: tempUsername,
        },
      });
    }, 2000);
  };

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
      // ✅ Navigate only after user clicks "OK" on success popup
      setTimeout(() => {
        navigate('/setup-profile', {
          state: {
            email: tempEmail,
            username: tempUsername,
          },
        });
      }, 2000);

  };


  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email address</label>
            <input type="email" value={email} required placeholder="johndoe@example.com" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Username</label>
            <input type="text" value={username} required placeholder="JohnDoe" onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
              <span className="toggle-icon1" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input type={showRepeatPassword ? 'text' : 'password'} value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder="Confirm password" required />
              <span className="toggle-icon1" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
                {showRepeatPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <button type="submit" className="signup-btn">Create account</button>
        </form>

        <div className="divider"><span>Or</span></div>

        <button className="google-signup-btn" onClick={handleGoogleSignup}>
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Continue with Google
        </button>

        <p className="login-redirect">
          Already have an account?{' '}
          <Link to="/login" title="Go back to login page" style={{ color: '#6495ED', fontWeight: '600' }}>
            Back to Login
          </Link>
        </p>
      </div>

      {toast.show && (
        <div className={`toast ${toast.success ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      {showVerifyPopup && (
        <div className="verify-popup">
          <div className="verify-popup-content">
            <p>🎯 Do you want to verify your email now?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
              <button className="signup-btn" onClick={handleVerifyNow}>Verify Now</button>
              <button className="signup-btn" onClick={handleVerifyLater}>Verify Later</button>
            </div>
          </div>
        </div>
      )}

        {/* ✅ Success Popup (when email is sent) */}
        {showSuccessPopup && <SuccessPopup onClose={handlePopupClose} />}
    </div>
  );
};

export default Signup;
