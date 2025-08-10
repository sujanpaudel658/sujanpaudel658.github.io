import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { authService } from './services/auth.service';
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const text = await res.text();
      if (res.ok) {
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        alert('Login failed: ' + text);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleGoogleLoginError = (error) => {
    console.error('Google login failed:', error);
    alert('Google sign-in failed. Please try again.');
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credentials received from Google');
      }

      const data = await authService.googleLogin(credentialResponse.credential);

      if (!data.user.profileCompleted) {
        // If profile is not completed, redirect to complete profile
        navigate('/google-name', {
          state: {
            email: data.user.email,
            given_name: data.user.firstName,
            family_name: data.user.lastName
          }
        });
      } else {
        // If profile is completed, go to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert(`Google Login Failed: ${err?.response?.data?.message || err.message || 'Please try again'}`);
      authService.logout();
    }
  };

  return (
    <div className="modern-page">
      <div className="welcome-panel">
        <div className="welcome-content">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-sign-in-alt"></i>
              <div className="logo-dot"></div>
            </div>
            <div className="logo-text">LOGIN</div>
          </div>
          <div className="welcome-text">
            <h1>Welcome back!</h1>
            <p>Sign in to your account and continue your journey with us.</p>
          </div>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99%</div>
              <div className="stat-label">Success</div>
            </div>
          </div>
          <div className="decorative-elements">
            <div className="chevron-up-left"></div>
            <div className="chevron-up-right"></div>
            <div className="floating-dots"></div>
          </div>
        </div>
      </div>
      <div className="form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>Sign In</h2>
            <p className="form-subtitle">Welcome back! Please enter your details</p>
          </div>
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <button type="button" onClick={() => navigate('/register')} className="secondary-btn">
                Don't have an account? Sign up
              </button>
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <div className="google-login-section">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleLoginError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width={300}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
