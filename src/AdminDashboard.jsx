import React from "react";

const AdminDashboard = () => {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5"
        }}>
            <h1 style={{ color: "#d32f2f", fontSize: 36, marginBottom: 12 }}>Admin Dashboard</h1>
            <p style={{ color: "#333", fontSize: 18, marginBottom: 24 }}>
                Welcome, Admin! Here you can manage users, posts, and platform settings.
            </p>
            <div style={{
                background: "#fff",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                minWidth: 320,
                textAlign: "center"
            }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ margin: "12px 0" }}><button className="primary-btn">View All Users</button></li>
                    <li style={{ margin: "12px 0" }}><button className="primary-btn">View All Posts</button></li>
                    <li style={{ margin: "12px 0" }}><button className="primary-btn">Delete Post</button></li>
                    <li style={{ margin: "12px 0" }}><button className="primary-btn">Platform Settings</button></li>
                </ul>
                <p style={{ color: "#888", fontSize: 13, marginTop: 18 }}>
                    (Functionality to be implemented)
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
