import axios from 'axios';

// Create an axios instance with base configurations
const axiosInstance = axios.create({
    // Base URL can be configured based on environment
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // If token exists, add it to headers
        if (token) {
            config.headers['x-auth-token'] = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors
        if (error.response && error.response.status === 401) {
            // Clear token if unauthorized
            localStorage.removeItem('token');

            // Redirect to login page if needed
            // This would typically use react-router's useNavigate in a component
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;