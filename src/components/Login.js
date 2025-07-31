import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../styles/login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../services/supabaseClient';
import { auth, provider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import googleLogo from '../assets/google logo.png';
import { useAuth } from '../services/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  
  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => {
      setToast({ show: false, message: '', success: true });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    
  const handleLogin = async (e) => {
    e.preventDefault();
  
    const { identifier, password } = formData;
    const email = identifier;
  
    if (!email || !password) {
      showToast("⚠️ Email and password are required.", false);
      return;
    }
  
    try {
      
      // 2. Fetch user from custom `users` table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
  
      if (error || !user) {
        showToast("❌ User not found .Please sigup first", false);
        return;
      }
  
      if (user.password !== password) {
        showToast("❌ Invalid password", false);
        return;
      }
  
      // 3. Set user in auth context
      setAuthUser(user);
  
      // 4. Log login
      await supabase.from('logins').insert([
        {
          user_id: user.id,
          username: user.username,
          login_method: 'supabase',
          login_time: new Date().toISOString(),
        },
      ]);
  
      showToast("🎉 Login successful!");
  
      // 5. Navigate with username/email in state
      setTimeout(() => {
        navigate('/find-events', {
          state: {
            username: user.username,
            email: user.email,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      showToast("🔥 Something went wrong. Please try again.", false);
    }
  };
      
  
  
  const handleGoogleLogin = async () => {
    try {
      await auth.signOut(); // force Google account chooser
      provider.setCustomParameters({ prompt: 'select_account' });
  
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
  
      const email = firebaseUser.email;
      const displayName = firebaseUser.displayName || 'User';
  
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
  
      if (fetchError || !existingUser) {
        showToast('❌ No user profile found. Please sign up first.', false);
        return;
      }
  
      setAuthUser(existingUser);
  
      await supabase.from('logins').insert([
        {
          user_id: existingUser.id,
          username: existingUser.username,
          login_method: 'google',
          login_time: new Date().toISOString(),
        },
      ]);
  
      showToast('✅ Google sign-in successful');
  
      setTimeout(() => {
        navigate('/find-events', {
          state: {
            username: existingUser.username,
            email: existingUser.email,
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      showToast('❌ Google sign-in failed.', false);
    }
  };
  
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Hello!</h1>
        <h2>Welcome back.</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              name="identifier"
              placeholder="johndoe@example.com"
              onChange={handleChange}
              value={formData.identifier}
              required
            />
          </div>
          <div className="input-group">
  <label>Password</label>
  <div style={{ position: 'relative' }}>
    <input
      type={showPassword ? 'text' : 'password'}
      name="password"
      placeholder="Enter your Password"
      onChange={handleChange}
      value={formData.password}
      required
    />
    <span
      className="toggle-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FaEye /> : <FaEyeSlash />}
    </span>
  </div>

  <p style={{ textAlign: 'right', marginTop: '10px' }}>
    <Link to="/reset-password" style={{ color: '#6495ED', textDecoration: 'none' }}>
      Forgot Password?
    </Link>
  </p>
</div>


          <button type="submit" className="login-btn">Log In</button>
        </form>

        <div className="divider">
          <span>Or</span>
        </div>

        <button className="google-signup-btn" onClick={handleGoogleLogin}>
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Continue with Google
        </button>
        
        <p className="signup-link">
            Don’t have an account? <Link to="/signup" title="Go to signup page" style={{color:'#6495ED',textDecoration:'none'}}>Create account</Link>
        </p>
      </div>

      {toast.show && (
        <div className={`toast ${toast.success ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Login;
