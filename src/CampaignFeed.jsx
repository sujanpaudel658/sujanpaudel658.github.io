import React, { useEffect, useState } from "react";
import './CampaignFeed.css';

const CampaignFeed = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/campaigns")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Campaigns data received:', data);
                setCampaigns(Array.isArray(data) ? data : []);
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                console.error('Error fetching campaigns:', err);
                setCampaigns([]);
                setLoading(false);
                setError(err.message);
            });
    }, []);

    if (loading) return <div className="feed-loading">Loading campaigns...</div>;

    if (error) return <div className="feed-error">Error loading campaigns: {error}</div>;

    return (
        <div className="feed-container">
            {campaigns.length === 0 && <div className="feed-empty">No campaigns yet. Be the first to start one!</div>}
            {campaigns.map(c => (
                <div className="feed-card" key={c._id}>
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
                        <div className="feed-date">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CampaignFeed;
