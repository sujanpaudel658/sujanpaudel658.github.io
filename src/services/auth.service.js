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

    async manualRegister(userData) {
        try {
            console.log('🔄 Manual registration attempt:', userData);
            console.log('🌐 API URL:', API_URL);

            const response = await api.post('/register', userData);
            console.log('✅ Registration response:', response.data);

            if (response.data.success) {
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('userToken', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('❌ Manual registration error:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error message:', error.message);

            // If axios fails, try with fetch as fallback
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                console.log('🔄 Trying fallback fetch method...');
                try {
                    const fetchResponse = await fetch(`${API_URL}/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify(userData)
                    });

                    const result = await fetchResponse.json();
                    console.log('✅ Fallback fetch response:', result);

                    if (result.success) {
                        localStorage.setItem('userEmail', result.user.email);
                        localStorage.setItem('userToken', result.token);
                    }
                    return result;
                } catch (fetchError) {
                    console.error('❌ Fallback fetch also failed:', fetchError);
                    throw fetchError;
                }
            }
            throw error;
        }
    },

    async manualLogin(credentials) {
        try {
            const response = await api.post('/login', credentials);
            if (response.data.success) {
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('userToken', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('Manual login error:', error.response || error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');
    }
};
