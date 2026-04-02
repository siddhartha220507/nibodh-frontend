import axios from 'axios';

// Agar kal ko live server pe deploy karega, toh bas yahan URL change karna
const API_URL = 'https://nibodh-backend.onrender.com/api/auth';

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        
        // Response mein se token aur user data mil gaya
        const { token, user } = response.data;
        
        // Token ko LocalStorage mein save kar diya (Jaise tune bola tha)
        if (token) {
            localStorage.setItem('token', token);
        }
        
        return response.data; // Component ko success dikhane ke liye data wapas bhej diya
    } catch (error) {
        // Axios error handling thodi alag hoti hai fetch se
        const message = error.response?.data?.message || 'Login failed. Server error.';
        throw new Error(message);
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        
        const { token, user } = response.data;
        
        // Auto-login: Register hote hi token save kar lo
        if (token) {
            localStorage.setItem('token', token);
        }
        
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Registration failed. Server error.';
        throw new Error(message);
    }
};

export const logoutUser = () => {
    // Logout pe bas local storage clear karni hoti hai
    localStorage.removeItem('token');
};