import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api/auth`
    : 'http://localhost:4000/api/auth';

const authService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            const { token, user } = response.data;
            localStorage.setItem('authToken', token);
            return { token, user };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed: Network error.');
        }
    },
    
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            const { token, user } = response.data;
            localStorage.setItem('authToken', token);           
            return { token, user };

        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed: Network error.');
        }
    }
};

export default authService;