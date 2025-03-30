import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const { login, error, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear validation errors when typing
        if (validationErrors[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: ''
            });
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            const success = await login(formData.email, formData.password);

            if (success) {
                navigate(from, { replace: true });
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2 className="auth-title">EduConnect Pakistan - Sign in</h2>
                    <p className="auth-subtitle">
                        Or{' '}
                        <Link to="/auth/register" className="auth-link">
                            create a new account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <h3 className="alert-title">{error}</h3>
                        </div>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={`form-input ${validationErrors.email ? 'error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {validationErrors.email && (
                            <p className="form-error">{validationErrors.email}</p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            className={`form-input ${validationErrors.password ? 'error' : ''}`}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {validationErrors.password && (
                            <p className="form-error">{validationErrors.password}</p>
                        )}
                    </div>

                    <div className="form-options">
                        <div className="form-checkbox">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="form-checkbox-input"
                            />
                            <label htmlFor="remember-me" className="form-checkbox-label">
                                Remember me
                            </label>
                        </div>

                        <Link to="/auth/forgot-password" className="auth-link">
                            Forgot your password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="form-button"
                    >
                        {loading && <span className="loading-spinner"></span>}
                        <span className="form-button-text">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;