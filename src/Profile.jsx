import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './CampaignFeed.css';
import './Profile.css';

const getUserEmail = () => localStorage.getItem('userEmail');

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        username: '',
        bio: '',
        gender: '',
        photo: ''
    });

    const [editMode, setEditMode] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const email = getUserEmail();

    useEffect(() => {
        if (email) {
            fetch(`http://localhost:3001/auth/profile?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setProfile({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            username: data.username || '',
                            bio: data.bio || '',
                            gender: data.gender || '',
                            photo: data.photo || ''
                        });
                        setPhotoPreview(data.photo ? `http://localhost:3001${data.photo}` : '');
                    }
                });
        }
    }, [email]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo' && files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);  // Set the photo preview (base64)
            };
            reader.readAsDataURL(files[0]);

            // Store the file object itself, for submission later
            setProfile(prev => ({ ...prev, photo: files[0] }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append('firstName', profile.firstName);
        formData.append('lastName', profile.lastName);
        formData.append('username', profile.username);
        formData.append('bio', profile.bio);
        formData.append('gender', profile.gender);
        formData.append('email', email);

        // Append photo if available
        if (profile.photo instanceof File) {
            formData.append('photo', profile.photo);
        }

        fetch(`http://localhost:3001/auth/profile`, {
            method: 'PUT',
            body: formData
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to update profile');
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    const userData = data.user;
                    setProfile({
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        username: userData.username || '',
                        bio: userData.bio || '',
                        gender: userData.gender || '',
                        photo: userData.photo || ''
                    });
                    setPhotoPreview(userData.photo ? `http://localhost:3001${userData.photo}` : '');
                    setEditMode(false);
                    alert('Profile updated successfully!');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            });
    };

    return (
        <div className="profile-container">
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 48px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: '#1877f2', letterSpacing: 2, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>NepalFund</div>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <Link to="/dashboard" style={{
                        color: location.pathname === '/dashboard' ? '#1877f2' : '#666',
                        textDecoration: 'none',
                        fontSize: 16,
                        fontWeight: location.pathname === '/dashboard' ? 600 : 500,
                        padding: '8px 16px',
                        borderRadius: 6,
                        background: location.pathname === '/dashboard' ? 'rgba(24, 119, 242, 0.1)' : 'transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                    }}
                        onMouseOver={e => {
                            if (location.pathname !== '/dashboard') {
                                e.target.style.color = '#1877f2';
                                e.target.style.background = 'rgba(24, 119, 242, 0.05)';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/dashboard') {
                                e.target.style.color = '#666';
                                e.target.style.background = 'transparent';
                            }
                        }}
                    >
                        Dashboard
                        {location.pathname === '/dashboard' && (
                            <div style={{
                                position: 'absolute',
                                bottom: -22,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 20,
                                height: 3,
                                background: '#1877f2',
                                borderRadius: 2
                            }}></div>
                        )}
                    </Link>

                    <Link to="/profile" style={{
                        color: location.pathname === '/profile' ? '#1877f2' : '#666',
                        textDecoration: 'none',
                        fontSize: 16,
                        fontWeight: location.pathname === '/profile' ? 600 : 500,
                        padding: '8px 16px',
                        borderRadius: 6,
                        background: location.pathname === '/profile' ? 'rgba(24, 119, 242, 0.1)' : 'transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                    }}
                        onMouseOver={e => {
                            if (location.pathname !== '/profile') {
                                e.target.style.color = '#1877f2';
                                e.target.style.background = 'rgba(24, 119, 242, 0.05)';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/profile') {
                                e.target.style.color = '#666';
                                e.target.style.background = 'transparent';
                            }
                        }}
                    >
                        Profile
                        {location.pathname === '/profile' && (
                            <div style={{
                                position: 'absolute',
                                bottom: -22,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 20,
                                height: 3,
                                background: '#1877f2',
                                borderRadius: 2
                            }}></div>
                        )}
                    </Link>
                </div>

                {/* Right side actions */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                    <Link to="/start-campaign" style={{
                        color: '#fff',
                        background: '#1877f2',
                        border: '2px solid #1877f2',
                        borderRadius: 8,
                        padding: '10px 22px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        fontSize: 16,
                        boxShadow: '0 2px 8px rgba(24,119,242,0.15)',
                        transition: 'all 0.2s ease',
                        display: 'inline-block'
                    }}
                        onMouseOver={e => {
                            e.target.style.background = '#1456b8';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(24,119,242,0.2)';
                        }}
                        onMouseOut={e => {
                            e.target.style.background = '#1877f2';
                            e.target.style.transform = 'translateY(0px)';
                            e.target.style.boxShadow = '0 2px 8px rgba(24,119,242,0.15)';
                        }}
                    >
                        Start Campaign
                    </Link>
                </div>
            </nav>

            <div className="profile-main">
                <div className="profile-title">My Profile</div>
                <img
                    className="profile-avatar"
                    src={photoPreview || 'https://ui-avatars.com/api/?name=User&background=1877f2&color=fff'}
                    alt="Profile"
                />

                {editMode ? (
                    <form className="profile-edit-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                        <input type="file" name="photo" accept="image/*" onChange={handleChange} />
                        <input
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                        />
                        <input
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                        />
                        <input
                            name="username"
                            value={profile.username}
                            onChange={handleChange}
                            placeholder="Username"
                        />
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            placeholder="Your bio..."
                        />
                        <select
                            name="gender"
                            value={profile.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="profile-btn-row">
                            <button type="submit" className="profile-btn">Save</button>
                            <button type="button" className="profile-btn cancel" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-info-row"><span className="profile-info-label">First Name:</span> {profile.firstName || 'Not set'}</div>
                        <div className="profile-info-row"><span className="profile-info-label">Last Name:</span> {profile.lastName || 'Not set'}</div>
                        <div className="profile-info-row"><span className="profile-info-label">Username:</span> {profile.username || 'Not set'}</div>
                        <div className="profile-info-row"><span className="profile-info-label">Bio:</span> {profile.bio || 'Not set'}</div>
                        <div className="profile-info-row"><span className="profile-info-label">Gender:</span> {profile.gender || 'Not set'}</div>
                        <div className="profile-btn-row">
                            <button className="profile-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
