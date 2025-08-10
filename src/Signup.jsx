import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    tos: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.tos) {
      newErrors.tos = "You must agree to the Terms of Service";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formData.dob,
      email: formData.email,
      password: formData.password
    };
    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (res.ok) {
        alert('Registration successful!');
        navigate('/login');
      } else {
        alert('Registration failed: ' + text);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3001/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userEmail', data.user.email);

        // For signup, always redirect to complete profile
        navigate('/google-name', {
          state: {
            email: data.user.email,
            given_name: data.user.firstName,
            family_name: data.user.lastName
          }
        });
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      alert('Google Sign Up Failed. Please try again.');
    }
  };

  const handleGoogleSignupError = (error) => {
    console.error('Google signup error:', error);
    alert('Google Sign Up Failed. Please try again.');
  };

  return (
    <div className="modern-page">
      <div className="welcome-panel">
        <div className="welcome-content">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-user-plus"></i>
              <div className="logo-dot"></div>
            </div>
            <div className="logo-text">SIGNUP</div>
          </div>
          <div className="welcome-text">
            <h1>Join our community!</h1>
            <p>Create your account and start your journey with us. We'll send a verification code to your email.</p>
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
            <h2>Create Account</h2>
            <p className="form-subtitle">Join thousands of users today</p>
          </div>
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>
            {/* Username removed */}
            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="form-input"
              />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>
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
              {errors.email && <span className="error-text">{errors.email}</span>}
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
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="tos"
                name="tos"
                checked={formData.tos}
                onChange={e => setFormData(prev => ({ ...prev, tos: e.target.checked }))}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="tos" style={{ margin: 0, fontSize: 15 }}>
                I agree to the <a href="#" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              </label>
              {errors.tos && <span className="error-text">{errors.tos}</span>}
            </div>
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate('/login')}>
                Already have an account?
              </button>
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <div className="google-login-section">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={handleGoogleSignupError}
                theme="outline"
                size="large"
                text="signup_with"
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

export default Signup;