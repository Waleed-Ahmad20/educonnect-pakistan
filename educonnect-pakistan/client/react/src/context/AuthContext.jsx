import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already logged in (token exists)
        const token = localStorage.getItem('token');
        if (token) {
            loadUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    // Load user profile from token
    const loadUser = async (token) => {
        try {
            setLoading(true);

            // Set default authorization header
            axios.defaults.headers.common['x-auth-token'] = token;

            const res = await axios.get('/api/auth/me');

            if (res.data.success) {
                setUser(res.data.data);
            } else {
                // If token is invalid, clear it
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['x-auth-token'];
            }
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setError(err.response?.data?.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.post('/api/auth/register', userData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['x-auth-token'] = res.data.token;
                setUser(res.data.data);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.post('/api/auth/login', { email, password });

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['x-auth-token'] = res.data.token;
                setUser(res.data.data);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.put('/api/auth/password', {
                currentPassword,
                newPassword
            });

            return res.data.success;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return user && user.role === role;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
                changePassword,
                hasRole,
                isAuthenticated: !!user,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;