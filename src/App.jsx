import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import {
    LandingPage,
    Login,
    Signup,
    Dashboard,
    AdminDashboard,
    GoogleNameForm,
    GooglePhoneForm,
    StartCampaign,
    Profile
} from './index';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/google-name" element={<GoogleNameForm />} />
                <Route path="/google-phone" element={<GooglePhoneForm />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/start-campaign" element={<StartCampaign />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;
