import React from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';
import CampaignFeed from './CampaignFeed';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)', fontFamily: 'Segoe UI, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 48px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 32, color: '#1877f2', letterSpacing: 2 }}>
          NepalFund
        </div>
        <div style={{ display: 'flex', gap: '18px' }}>
          <Link to="/login" style={{
            color: '#1877f2',
            background: '#fff',
            border: '2px solid #1877f2',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(24,119,242,0.04)',
            transition: 'background 0.2s, color 0.2s',
            display: 'inline-block'
          }}
            onMouseOver={e => { e.target.style.background = '#1877f2'; e.target.style.color = '#fff'; }}
            onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = '#1877f2'; }}
          >
            Login
          </Link>
          <Link to="/register" style={{
            color: '#fff',
            background: '#1877f2',
            border: '2px solid #1877f2',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(24,119,242,0.08)',
            transition: 'background 0.2s, color 0.2s',
            display: 'inline-block'
          }}
            onMouseOver={e => { e.target.style.background = '#1456b8'; }}
            onMouseOut={e => { e.target.style.background = '#1877f2'; }}
          >
            Register
          </Link>
        </div>
      </nav>
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#1a237e', textAlign: 'center', padding: '0 16px' }}>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 900, marginBottom: 24, letterSpacing: 1, color: '#1877f2' }}>Empower Hope. Fund Dreams.</h1>
        <p style={{ fontSize: '1.4rem', maxWidth: 600, margin: '0 auto 40px auto', opacity: 0.95, color: '#333' }}>
          NepalFund is a platform to support causes, dreams, and emergencies in Nepal. Start a fundraiser or help someone in need today. Join a community that believes in making a difference—one story at a time.
        </p>
        <Link to="/register" style={{ background: '#1877f2', color: '#fff', fontWeight: 700, fontSize: 20, borderRadius: 10, padding: '16px 48px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(24,119,242,0.10)', transition: 'background 0.2s, color 0.2s' }}>
          Get Started
        </Link>
      </section>
      {/* Campaign Feed Section */}
      <CampaignFeed />
    </div>
  );
};

export default LandingPage;
