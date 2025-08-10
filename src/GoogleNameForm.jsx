import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleNameForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const [firstName, setFirstName] = useState(state.given_name || "");
    const [lastName, setLastName] = useState(state.family_name || "");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);  // Button disable state
    const email = state.email || "";

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone validation (must be exactly 10 digits)
        const cleanedPhone = phone.replace(/\D/g, "");
        if (!firstName.trim() || !lastName.trim() || cleanedPhone.length !== 10) {
            setError("All fields are required and phone must be 10 digits");
            return;
        }

        const payload = {
            name: `${firstName} ${lastName}`,
            phoneNumber: cleanedPhone,
            email
        };

        setIsSubmitting(true);  // Disable the button while submitting
        setError("");  // Reset any previous error

        try {
            // Use the correct backend URL and route
            const url = 'http://localhost:3001/auth/google-register';

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save profile");
            }

            // Navigate to dashboard after successful submission
            navigate('/dashboard', { state: { firstName, lastName, phone: cleanedPhone } });
        } catch (err) {
            setError("Failed to save. Try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);  // Re-enable button after submission
        }
    };

    return (
        <div className="google-form-3d-center">
            <h2 className="google-form-title">Complete Your Profile</h2>
            <form onSubmit={handleSubmit} className="google-form-3d-box" style={{ maxWidth: 350, margin: '0 auto' }}>
                <div className="input-group">
                    <label>First Name</label>
                    <input
                        className="form-input"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                    />
                </div>
                <div className="input-group">
                    <label>Last Name</label>
                    <input
                        className="form-input"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                    />
                </div>
                <div className="input-group">
                    <label>Phone Number</label>
                    <input
                        className="form-input"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        type="text"
                    />
                </div>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <button
                    className="primary-btn"
                    type="submit"
                    disabled={isSubmitting}  // Disable the button during submission
                >
                    {isSubmitting ? "Submitting..." : "Continue"}
                </button>
            </form>
        </div>
    );
};

export default GoogleNameForm;
