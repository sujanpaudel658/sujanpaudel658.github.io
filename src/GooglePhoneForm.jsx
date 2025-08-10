import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GooglePhoneForm = () => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);  // New state for button disabling
    const navigate = useNavigate();
    const location = useLocation();
    const { firstName, lastName } = location.state || {};

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number (10 digits)
        const cleanedPhone = phone.replace(/\D/g, "");
        if (cleanedPhone.length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        // Prepare payload
        const payload = {
            name: `${firstName} ${lastName}`,
            phoneNumber: cleanedPhone
        };

        setIsSubmitting(true);  // Disable the button when submitting
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
                throw new Error(errorData.message || "Failed to register phone number");
            }

            // After successful submission, navigate to the dashboard with data
            navigate("/dashboard", { state: { firstName, lastName, phone: cleanedPhone } });
        } catch (err) {
            setError("An error occurred while submitting your phone number. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);  // Re-enable button after submission
        }
    };

    // If no firstName or lastName, redirect to name form
    if (!firstName || !lastName) {
        navigate("/google-name");
        return null;
    }

    return (
        <div className="form-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <h2 style={{ color: "#1877f2", marginBottom: 16 }}>Enter Your Phone Number</h2>
            <form onSubmit={handleSubmit} style={{ minWidth: 300 }}>
                <div className="input-group" style={{ marginBottom: 12 }}>
                    <label>Phone Number</label>
                    <input
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        type="text"
                    />
                </div>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <button
                    className="primary-btn"
                    type="submit"
                    style={{ width: "100%", marginTop: 8 }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Finish"}
                </button>
            </form>
        </div>
    );
};

export default GooglePhoneForm;
