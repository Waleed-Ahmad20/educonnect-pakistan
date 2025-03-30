import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'student' // Default role
    });
    const [validationErrors, setValidationErrors] = useState({});

    const { register, error, loading } = useAuth();
    const navigate = useNavigate();

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
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.firstName) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName) {
            errors.lastName = 'Last name is required';
        }

        if (!formData.phone) {
            errors.phone = 'Phone number is required';
        } else if (!/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            // Remove confirmPassword as it's not needed in the API
            const { confirmPassword, ...userData } = formData;

            const success = await register(userData);

            if (success) {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2 className="auth-title">Create your account</h2>
                    <p className="auth-subtitle">
                        Or{' '}
                        <Link to="/auth/login" className="auth-link">
                            sign in to existing account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <div className="alert-icon">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <h3 className="alert-title">{error}</h3>
                        </div>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-grid form-grid-2col">
                            <div className="form-field">
                                <label htmlFor="firstName" className="form-label">First name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                {validationErrors.firstName && (
                                    <p className="form-error">{validationErrors.firstName}</p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="lastName" className="form-label">Last name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                                {validationErrors.lastName && (
                                    <p className="form-error">{validationErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {validationErrors.email && (
                                <p className="form-error">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="phone" className="form-label">Phone number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                autoComplete="tel"
                                placeholder="+923001234567"
                                className={`form-input ${validationErrors.phone ? 'error' : ''}`}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {validationErrors.phone && (
                                <p className="form-error">{validationErrors.phone}</p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="role" className="form-label">I want to register as</label>
                            <select
                                id="role"
                                name="role"
                                className="form-select"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="tutor">Tutor</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {validationErrors.password && (
                                <p className="form-error">{validationErrors.password}</p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {validationErrors.confirmPassword && (
                                <p className="form-error">{validationErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="form-button"
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                <span className="form-button-text">Creating account...</span>
                            </>
                        ) : (
                            <span className="form-button-text">Create account</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;