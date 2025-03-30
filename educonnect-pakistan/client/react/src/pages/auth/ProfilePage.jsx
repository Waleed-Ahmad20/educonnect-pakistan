import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, changePassword, error, loading, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [studentData, setStudentData] = useState({
        educationLevel: user?.educationLevel || '',
        institution: user?.institution || '',
        subjects: user?.subjects?.join(', ') || ''
    });
    
    const [tutorData, setTutorData] = useState({
        bio: user?.bio || '',
        location: {
            city: user?.location?.city || '',
            address: user?.location?.address || ''
        },
        hourlyRate: user?.hourlyRate || '',
        teachingPreference: user?.teachingPreference || 'both'
    });
    
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
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

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitPasswordChange = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (validatePasswordForm()) {
            const success = await changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (success) {
                setSuccessMessage('Password changed successfully');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        }
    };

    const handleStudentDataChange = (e) => {
        setStudentData({
            ...studentData,
            [e.target.name]: e.target.value
        });
    };

    const handleTutorDataChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('location.')) {
            const locationField = name.split('.')[1];
            setTutorData({
                ...tutorData,
                location: {
                    ...tutorData.location,
                    [locationField]: value
                }
            });
        } else {
            setTutorData({
                ...tutorData,
                [name]: value
            });
        }
    };

    const handleSaveStudentData = async () => {
        try {
            setUpdateError('');
            setUpdateSuccess('');
            
            // Prepare data for API
            const dataToUpdate = {
                educationLevel: studentData.educationLevel,
                institution: studentData.institution,
                subjects: studentData.subjects.split(',').map(subject => subject.trim()).filter(subject => subject)
            };
            
            const response = await axios.put('/api/students/profile', dataToUpdate);
            
            if (response.data.success) {
                // Update local user data
                setUser({
                    ...user,
                    ...dataToUpdate
                });
                setUpdateSuccess('Profile updated successfully');
                setIsEditing(false);
            }
        } catch (err) {
            setUpdateError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleSaveTutorData = async () => {
        try {
            setUpdateError('');
            setUpdateSuccess('');
            
            // Prepare data for API
            const dataToUpdate = {
                bio: tutorData.bio,
                location: tutorData.location,
                hourlyRate: parseFloat(tutorData.hourlyRate),
                teachingPreference: tutorData.teachingPreference
            };
            
            const response = await axios.put('/api/tutors/profile', dataToUpdate);
            
            if (response.data.success) {
                // Update local user data
                setUser({
                    ...user,
                    ...dataToUpdate
                });
                setUpdateSuccess('Profile updated successfully');
                setIsEditing(false);
            }
        } catch (err) {
            setUpdateError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    // Render role-specific profile information
    const renderRoleSpecificInfo = () => {
        if (!user) return null;

        switch (user.role) {
            case 'student':
                return (
                    <div className="info-container">
                        <div className="info-header">
                            <h3 className="profile-title">Student Information</h3>
                        </div>
                        {updateSuccess && (
                            <div className="success-message mb-4">
                                {updateSuccess}
                            </div>
                        )}
                        {updateError && (
                            <div className="error-message mb-4">
                                {updateError}
                            </div>
                        )}
                        <div className="info-body">
                            <div className="info-grid">
                                <div className="info-field">
                                    <label className="info-label">Education Level</label>
                                    {isEditing ? (
                                        <select
                                            name="educationLevel"
                                            value={studentData.educationLevel}
                                            onChange={handleStudentDataChange}
                                            className="form-input"
                                        >
                                            <option value="">Select education level</option>
                                            <option value="primary">Primary</option>
                                            <option value="middle">Middle</option>
                                            <option value="matric">Matric</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="bachelors">Bachelor's</option>
                                            <option value="masters">Master's</option>
                                            <option value="phd">PhD</option>
                                        </select>
                                    ) : (
                                        <div className="info-value capitalize">{user.educationLevel || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Institution</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="institution"
                                            value={studentData.institution}
                                            onChange={handleStudentDataChange}
                                            className="form-input"
                                            placeholder="Your school or university"
                                        />
                                    ) : (
                                        <div className="info-value">{user.institution || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Subjects</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="subjects"
                                            value={studentData.subjects}
                                            onChange={handleStudentDataChange}
                                            className="form-input"
                                            placeholder="Comma-separated list of subjects"
                                        />
                                    ) : (
                                        <div className="info-value">
                                            {user.subjects && user.subjects.length > 0 
                                                ? user.subjects.join(', ') 
                                                : 'No subjects specified'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                {isEditing ? (
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={handleSaveStudentData}
                                            className="form-button bg-green-600 hover:bg-green-700"
                                        >
                                            <span className="form-button-text">Save</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setStudentData({
                                                    educationLevel: user?.educationLevel || '',
                                                    institution: user?.institution || '',
                                                    subjects: user?.subjects?.join(', ') || ''
                                                });
                                            }}
                                            className="form-button bg-gray-500 hover:bg-gray-600"
                                        >
                                            <span className="form-button-text">Cancel</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="form-button"
                                    >
                                        <span className="form-button-text">Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'tutor':
                return (
                    <div className="info-container">
                        <div className="info-header">
                            <h3 className="profile-title">Tutor Information</h3>
                        </div>
                        {updateSuccess && (
                            <div className="success-message mb-4">
                                {updateSuccess}
                            </div>
                        )}
                        {updateError && (
                            <div className="error-message mb-4">
                                {updateError}
                            </div>
                        )}
                        <div className="info-body">
                            <div className="info-grid">
                                <div className="info-field">
                                    <label className="info-label">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            value={tutorData.bio}
                                            onChange={handleTutorDataChange}
                                            className="form-textarea"
                                            placeholder="Write a brief description about yourself"
                                            rows={4}
                                        ></textarea>
                                    ) : (
                                        <div className="info-value">{user.bio || 'Not provided'}</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Hourly Rate (PKR)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={tutorData.hourlyRate}
                                            onChange={handleTutorDataChange}
                                            className="form-input"
                                            placeholder="Your hourly rate in PKR"
                                            min="0"
                                        />
                                    ) : (
                                        <div className="info-value">₨ {user.hourlyRate || 0}/hour</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Teaching Preference</label>
                                    {isEditing ? (
                                        <select
                                            name="teachingPreference"
                                            value={tutorData.teachingPreference}
                                            onChange={handleTutorDataChange}
                                            className="form-select"
                                        >
                                            <option value="online">Online Only</option>
                                            <option value="in-person">In-Person Only</option>
                                            <option value="both">Both Online & In-Person</option>
                                        </select>
                                    ) : (
                                        <div className="info-value capitalize">
                                            {user.teachingPreference === 'both' ? 'Online & In-Person' : user.teachingPreference || 'Not specified'}
                                        </div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="location.city"
                                            value={tutorData.location.city}
                                            onChange={handleTutorDataChange}
                                            className="form-input"
                                            placeholder="Your city"
                                        />
                                    ) : (
                                        <div className="info-value">{user.location?.city || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="location.address"
                                            value={tutorData.location.address}
                                            onChange={handleTutorDataChange}
                                            className="form-input"
                                            placeholder="Your address (optional)"
                                        />
                                    ) : (
                                        <div className="info-value">{user.location?.address || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Rating</label>
                                    <div className="info-value">
                                        {user.averageRating ? `${user.averageRating.toFixed(1)} / 5 (${user.totalReviews} reviews)` : 'No ratings yet'}
                                    </div>
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Subjects</label>
                                    <div className="info-value">
                                        {user.subjects && user.subjects.length > 0 
                                            ? user.subjects.map(subject => 
                                                typeof subject === 'object' && subject.name && subject.level 
                                                  ? `${subject.name}` 
                                                  : (subject.name || subject.toString())
                                              ).join(', ') 
                                            : 'No subjects specified'}
                                    </div>
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Verification Status</label>
                                    <div className="info-value">
                                        {user.isVerified 
                                            ? <span className="verified-badge">Verified</span> 
                                            : <span className="pending-badge">Pending Verification</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                {isEditing ? (
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={handleSaveTutorData}
                                            className="form-button bg-green-600 hover:bg-green-700"
                                        >
                                            <span className="form-button-text">Save</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setTutorData({
                                                    bio: user?.bio || '',
                                                    location: {
                                                        city: user?.location?.city || '',
                                                        address: user?.location?.address || ''
                                                    },
                                                    hourlyRate: user?.hourlyRate || '',
                                                    teachingPreference: user?.teachingPreference || 'both'
                                                });
                                            }}
                                            className="form-button bg-gray-500 hover:bg-gray-600"
                                        >
                                            <span className="form-button-text">Cancel</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="form-button"
                                    >
                                        <span className="form-button-text">Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="info-container">
                        <div className="info-header">
                            <h3 className="profile-title">Administrator Information</h3>
                        </div>
                        <div className="info-body">
                            <div className="info-grid">
                                <div className="info-field">
                                    <label className="info-label">Admin Level</label>
                                    <div className="info-value capitalize">{user.adminLevel || 'Standard'}</div>
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Permissions</label>
                                    <div className="info-value">
                                        {user.permissions && user.permissions.length > 0 
                                            ? user.permissions.map(perm => (
                                                <span key={perm} className="permission-badge">
                                                    {perm.replace(/_/g, ' ')}
                                                </span>
                                              ))
                                            : 'No special permissions'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-section">
                    <div className="profile-header">
                        <h3 className="profile-title">Profile</h3>
                        <p className="profile-subtitle">
                            Your account information and preferences.
                        </p>
                    </div>
                    <div className="info-container">
                        <div className="info-header">
                            <h3 className="profile-title">Account Information</h3>
                        </div>
    
                        <div className="info-body">
                            <div className="info-grid">
                                <div className="info-field">
                                    <label className="info-label">Name</label>
                                    <div className="info-value">{user.firstName} {user.lastName}</div>
                                </div>
    
                                <div className="info-field">
                                    <label className="info-label">Email</label>
                                    <div className="info-value">{user.email}</div>
                                </div>
    
                                <div className="info-field">
                                    <label className="info-label">Phone</label>
                                    <div className="info-value">{user.phone}</div>
                                </div>
    
                                <div className="info-field">
                                    <label className="info-label">Role</label>
                                    <div className="info-value capitalize">{user.role}</div>
                                </div>
    
                                <div className="info-field">
                                    <label className="info-label">Last Login</label>
                                    <div className="info-value">
                                        {new Date(user.lastLogin).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role-specific information */}
                    {renderRoleSpecificInfo()}
                </div>
    
                <div className="section-divider"></div>
    
                <div className="profile-section">
                    <div className="profile-header">
                        <h3 className="profile-title">Change Password</h3>
                        <p className="profile-subtitle">
                            Update your password to keep your account secure.
                        </p>
                    </div>
                    <form onSubmit={handleSubmitPasswordChange}>
                        <div className="info-container">
                            <div className="info-body">
                                {error && (
                                    <div className="alert alert-error">
                                        <div className="alert-icon">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="alert-content">
                                            <h3 className="alert-title">{error}</h3>
                                        </div>
                                    </div>
                                )}
    
                                {successMessage && (
                                    <div className="alert alert-success">
                                        <div className="alert-icon">
                                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="alert-content">
                                            <h3 className="alert-title">{successMessage}</h3>
                                        </div>
                                    </div>
                                )}
    
                                <div className="form-field">
                                    <label htmlFor="currentPassword" className="form-label">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        id="currentPassword"
                                        className={`form-input ${validationErrors.currentPassword ? 'error' : ''}`}
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {validationErrors.currentPassword && (
                                        <p className="form-error">{validationErrors.currentPassword}</p>
                                    )}
                                </div>
    
                                <div className="form-field">
                                    <label htmlFor="newPassword" className="form-label">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        className={`form-input ${validationErrors.newPassword ? 'error' : ''}`}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {validationErrors.newPassword && (
                                        <p className="form-error">{validationErrors.newPassword}</p>
                                    )}
                                </div>
    
                                <div className="form-field">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {validationErrors.confirmPassword && (
                                        <p className="form-error">{validationErrors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="form-button"
                                >
                                    {loading ? <span className="loading-spinner"></span> : null}
                                    <span className="form-button-text">{loading ? 'Updating...' : 'Update Password'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;