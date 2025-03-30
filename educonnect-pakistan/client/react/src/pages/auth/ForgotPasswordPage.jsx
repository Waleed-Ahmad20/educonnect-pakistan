import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Reusing the login page styles

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
        setValidationError('');
    };

    const validate = () => {
        if (!email) {
            setValidationError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setValidationError('Email is invalid');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError('');
            
            // Note: This is a placeholder for future API implementation
            // The backend endpoint doesn't exist yet, so we're simulating success
            // await axios.post('/api/auth/forgot-password', { email });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSubmitSuccess(true);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to process your request. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2 className="auth-title">Reset Your Password</h2>
                    <p className="auth-subtitle">
                        Enter your email address and we'll send you instructions to reset your password
                    </p>
                </div>

                {submitError && (
                    <div className="alert alert-error">
                        <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <h3 className="alert-title">{submitError}</h3>
                        </div>
                    </div>
                )}

                {submitSuccess ? (
                    <div className="success-message">
                        <div className="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="40" height="40">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3>Check Your Email</h3>
                        <p>We've sent password reset instructions to your email address.</p>
                        <Link to="/auth/login" className="form-button">
                            Return to Sign In
                        </Link>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`form-input ${validationError ? 'error' : ''}`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleChange}
                            />
                            {validationError && (
                                <p className="form-error">{validationError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="form-button"
                        >
                            {isSubmitting && <span className="loading-spinner"></span>}
                            <span className="form-button-text">
                                {isSubmitting ? 'Submitting...' : 'Reset Password'}
                            </span>
                        </button>

                        <div className="auth-links">
                            <Link to="/auth/login" className="auth-link">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 