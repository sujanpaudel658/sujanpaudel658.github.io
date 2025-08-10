import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

export const authService = {
    async googleLogin(credential) {
        try {
            const response = await api.post('/auth/google-login', { credential });
            if (response.data.success) {
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('userToken', credential);
            }
            return response.data;
        } catch (error) {
            console.error('Google login error:', error.response || error);
            throw error;
        }
    },

    async checkAuth() {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) throw new Error('No token found');

            const response = await api.get('/check-auth', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Auth check error:', error.response || error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');
    }
};
