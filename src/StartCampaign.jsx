import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import './CampaignFeed.css';

const StartCampaign = () => {
    const location = useLocation();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [description, setDescription] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !amount || photos.length === 0 || !description.trim() || !agreed) {
            setError("All fields are required and you must agree to the terms.");
            return;
        }
        setError("");
        let photoUrls = [];
        try {
            // Upload all images to imgur
            for (let file of photos) {
                const formData = new FormData();
                formData.append('image', file);
                const imgurRes = await fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: { Authorization: 'Client-ID 137e8e6e6e7e7e6' },
                    body: formData
                });
                const imgurData = await imgurRes.json();
                if (imgurData.success) {
                    photoUrls.push(imgurData.data.link);
                }
            }
        } catch (err) {
            // fallback: no image
        }
        try {
            // Get user email and username from localStorage (for demo)
            const email = localStorage.getItem('userEmail') || '';
            const userProfile = localStorage.getItem('userProfile');
            let username = '';
            if (userProfile) {
                try { username = JSON.parse(userProfile).username || ''; } catch { }
            }
            const payload = { title, amount: Number(amount), photoUrls, description, email, username };
            const res = await fetch('http://localhost:3001/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newCampaign = await res.json();
                navigate('/dashboard', { state: { newCampaign } });
            } else {
                setError('Failed to submit campaign.');
            }
        } catch (err) {
            setError('Failed to submit campaign.');
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
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
                        background: location.pathname === '/start-campaign' ? '#1456b8' : '#1877f2',
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
                            if (location.pathname !== '/start-campaign') {
                                e.target.style.background = '#1456b8';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(24,119,242,0.2)';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/start-campaign') {
                                e.target.style.background = '#1877f2';
                                e.target.style.transform = 'translateY(0px)';
                                e.target.style.boxShadow = '0 2px 8px rgba(24,119,242,0.15)';
                            }
                        }}
                    >
                        Start Campaign
                        {location.pathname === '/start-campaign' && (
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
            </nav>

            <div className="feed-container" style={{ maxWidth: 500, margin: "48px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(24,119,242,0.08)", padding: 32 }}>
                <h2 style={{ textAlign: "center", color: "#1877f2", fontWeight: 800, marginBottom: 24 }}>Start a Campaign</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Campaign Title</label>
                        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Help My Father Fight Cancer" />
                    </div>
                    <div className="input-group">
                        <label>Amount to Raise (NPR)</label>
                        <input className="form-input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100000" />
                    </div>
                    <div className="input-group">
                        <label>Campaign Photos (you can select multiple)</label>
                        <input
                            className="form-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={e => {
                                const files = Array.from(e.target.files);
                                setPhotos(files);
                                setPhotoPreviews(files.map(file => URL.createObjectURL(file)));
                            }}
                        />
                        {photoPreviews.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                {photoPreviews.map((src, idx) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt={`preview-${idx}`}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '2px solid #e0eafc', boxShadow: '0 2px 8px #1877f222' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="input-group">
                        <label>Campaign Description</label>
                        <textarea className="form-input" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your story, why you need help, etc." />
                    </div>
                    <div style={{ margin: "18px 0" }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 4 }} />
                            <span style={{ fontSize: 14, color: "#333" }}>
                                I agree that this campaign is genuine and understand that if it is found to be fake, I will be liable for strict police action and legal consequences as per Nepal law.
                            </span>
                        </label>
                    </div>
                    {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}
                    <button className="primary-btn" type="submit" style={{ width: "100%", marginTop: 8 }}>Submit Campaign</button>
                </form>
            </div>
        </div>
    );
};

export default StartCampaign;
