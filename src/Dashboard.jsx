import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './CampaignFeed.css';

const Dashboard = () => {
    const location = useLocation();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    // Check if user is logged in
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            navigate('/login');
        }
    }, [navigate]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        fetch("http://localhost:3001/campaigns")
            .then(res => res.json())
            .then(data => {
                // Algorithm: sort by amount descending, then by date
                data.sort((a, b) => {
                    if (b.amount !== a.amount) return b.amount - a.amount;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                let allCampaigns = data;
                if (location.state && location.state.newCampaign) {
                    allCampaigns = [location.state.newCampaign, ...data];
                }
                setCampaigns(allCampaigns);
                setLoading(false);
            });
    }, [location.state]);

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 48px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: '#1877f2', letterSpacing: 2, cursor: 'pointer' }} onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                }}>NepalFund</div>

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
                    <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 8 }}>
                        <button
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            onClick={() => setDropdownOpen(d => !d)}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
                        </button>
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 38,
                                background: '#fff',
                                border: '1px solid #e0eafc',
                                borderRadius: 10,
                                boxShadow: '0 4px 16px #1877f222',
                                minWidth: 150,
                                zIndex: 1000,
                                padding: 0
                            }}>
                                <button
                                    style={{
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        padding: '12px 18px',
                                        textAlign: 'left',
                                        fontSize: 16,
                                        color: '#1877f2',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #e0eafc',
                                        borderRadius: '10px 10px 0 0'
                                    }}
                                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                                >
                                    My Profile
                                </button>
                                <button
                                    style={{
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        padding: '12px 18px',
                                        textAlign: 'left',
                                        fontSize: 16,
                                        color: '#e53935',
                                        cursor: 'pointer',
                                        borderRadius: '0 0 10px 10px'
                                    }}
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        localStorage.removeItem('userEmail');
                                        navigate('/login');
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            {/* Dashboard Content */}
            <div className="dashboard-feed-scroll" style={{
                maxWidth: 700,
                margin: '32px auto 0 auto',
                padding: '0 12px',
                maxHeight: '70vh',
                overflowY: 'auto',
                borderRadius: 16,
                background: '#fafdff',
                boxShadow: '0 2px 16px rgba(24,119,242,0.06)'
            }}>
                <h1 style={{ color: "#1877f2", fontSize: 32, marginBottom: 18, textAlign: 'center', fontWeight: 900 }}>Your Dashboard</h1>
                <p style={{ color: "#333", fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
                    Welcome! Here are the latest campaigns including yours:
                </p>
                {loading ? (
                    <div className="feed-loading">Loading campaigns...</div>
                ) : (
                    <div className="feed-container">
                        {campaigns.length === 0 && <div className="feed-empty">No campaigns yet. Be the first to start one!</div>}
                        {campaigns.map(c => (
                            <div className="feed-card" key={c._id || c.title + Math.random()}>
                                {Array.isArray(c.photoUrls) && c.photoUrls.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', padding: 8 }}>
                                        {c.photoUrls.map((url, idx) => (
                                            <img key={url} src={url} alt={c.title + idx} className="feed-img" style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover' }} />
                                        ))}
                                    </div>
                                )}
                                <div className="feed-content">
                                    <h3 className="feed-title">{c.title}</h3>
                                    <div className="feed-amount">Target: NPR {c.amount.toLocaleString()}</div>
                                    <p className="feed-desc">{c.description}</p>
                                    <div className="feed-date">{c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Just now'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
