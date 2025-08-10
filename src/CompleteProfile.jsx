import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Profile.css';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};

    React.useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3001/check-session', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    navigate('/login');
                    return;
                }

                const data = await response.json();
                if (!data.loggedIn) {
                    navigate('/login');
                    return;
                }

                if (data.user.profileCompleted) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Session check error:', error);
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);

    const [formData, setFormData] = useState({
        phone: '',
        gender: '',
        dob: '',
        bio: ''
    }); const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate required fields
            const requiredFields = ['phone', 'gender', 'dob'];
            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Get existing user data
            const existingUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await fetch('http://localhost:3001/complete-google-profile', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: existingUser.id || userId,
                    ...formData
                }),
            }); const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete profile');
            }

            if (data.success) {
                // Update the user in localStorage with the completed profile
                const updatedUser = {
                    ...existingUser,
                    ...data.user,
                    profileCompleted: true
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                alert('Profile completed successfully! Welcome to the dashboard.');
                navigate('/dashboard');
            } else {
                throw new Error(data.message || 'Failed to complete profile');
            }
        } catch (error) {
            console.error('Error completing profile:', error);
            if (error.message === 'Profile is already completed') {
                navigate('/dashboard');
            } else {
                alert(error.message || 'Failed to complete profile. Please try again.');
            }
        }
    }; return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Complete Your Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
