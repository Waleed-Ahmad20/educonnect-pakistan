import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './TutorCard.css';

const TutorCard = ({ tutor }) => {
    const { user } = useAuth();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Check wishlist status on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user || user.role !== 'student' || !tutor._id) return;
            
            try {
                const res = await axios.get('/api/students/wishlist');
                if (res.data.success) {
                    const tutors = res.data.data.tutors || [];
                    setIsInWishlist(tutors.some(item => item._id === tutor._id));
                }
            } catch (err) {
                console.error('Failed to check wishlist status:', err);
            }
        };
        
        checkWishlistStatus();
    }, [user, tutor._id]);

    // Handle adding/removing from wishlist
    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || user.role !== 'student') {
            // Redirect to login or show login prompt
            return;
        }

        try {
            setLoading(true);
            const endpoint = isInWishlist 
                ? `/api/students/wishlist/remove/${tutor._id}`
                : `/api/students/wishlist/add/${tutor._id}`;
            
            const res = await axios.post(endpoint);
            
            if (res.data.success) {
                setIsInWishlist(!isInWishlist);
            }
        } catch (err) {
            console.error('Wishlist toggle failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Render star rating
    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
        
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRating) {
                // Full star
                stars.push(
                    <svg key={i} className="star-icon star-filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                );
            } else if (i - 0.5 === roundedRating) {
                // Half star
                stars.push(
                    <svg key={i} className="star-icon star-half" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        <path fill="white" d="M12 15.4V6.1l1.71 4.03 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                    </svg>
                );
            } else {
                // Empty star
                stars.push(
                    <svg key={i} className="star-icon star-empty" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                );
            }
        }
        
        return stars;
    };

    return (
        <div className="tutor-card">
            <Link to={`/tutor/${tutor._id}`} className="tutor-link">
                <div className="tutor-content">
                    {/* Tutor Image */}
                    <div className="tutor-image-container">
                        <img 
                            src={tutor.profilePicture || 'https://via.placeholder.com/150?text=Tutor'} 
                            alt={`${tutor.firstName} ${tutor.lastName}`}
                            className="tutor-image"
                        />
                    </div>
                    
                    {/* Tutor Info */}
                    <div className="tutor-info">
                        <div className="tutor-header">
                            <h3 className="tutor-name">
                                {tutor.firstName} {tutor.lastName}
                                {tutor.isVerified && (
                                    <span className="verified-badge" title="Verified Tutor">
                                        <svg className="verified-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </h3>
                            
                            {/* Wishlist Button */}
                            <button 
                                onClick={handleWishlistToggle} 
                                disabled={loading}
                                className={`wishlist-button ${isInWishlist ? 'in-wishlist' : ''}`}
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {isInWishlist ? (
                                    <svg className="wishlist-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                ) : (
                                    <svg className="wishlist-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        {/* Rating */}
                        <div className="rating-container">
                            <div className="stars-container">
                                {renderStars(tutor.averageRating || 0)}
                            </div>
                            <span className="review-count">
                                ({tutor.totalReviews || 0} reviews)
                            </span>
                        </div>
                        
                        {/* Subjects */}
                        <div className="tutor-details">
                            <span className="detail-label">Subjects: </span>
                            {tutor.subjects && tutor.subjects.length > 0 
                                ? tutor.subjects.map(subject => subject.name).join(', ')
                                : 'Not specified'}
                        </div>
                        
                        {/* Location */}
                        <div className="tutor-details">
                            <span className="detail-label">Location: </span>
                            {tutor.location?.city || 'Not specified'}
                            {tutor.teachingPreference && (
                                <span className="teaching-preference">
                                    ({tutor.teachingPreference === 'both' 
                                      ? 'Online & In-person' 
                                      : tutor.teachingPreference})
                                </span>
                            )}
                        </div>
                        
                        {/* Price */}
                        <div className="tutor-price">
                            ₨ {tutor.hourlyRate || 0}/hour
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default TutorCard;