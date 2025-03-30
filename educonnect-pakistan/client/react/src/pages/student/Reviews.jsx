import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Reviews = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingReviews, setPendingReviews] = useState([]);

    // Fetch reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch submitted reviews
                const reviewsRes = await axios.get('/api/reviews/student');
                
                if (reviewsRes.data.success) {
                    // Check if data is nested or direct array
                    if (reviewsRes.data.data && typeof reviewsRes.data.data === 'object' && reviewsRes.data.data.reviews) {
                        setReviews(reviewsRes.data.data.reviews || []);
                    } else {
                        setReviews(reviewsRes.data.data || []);
                    }
                    
                    try {
                        // Fetch completed sessions without reviews
                        const pendingRes = await axios.get('/api/sessions/student/pending-reviews');
                        
                        if (pendingRes.data.success) {
                            // Check if data is nested or direct array
                            if (pendingRes.data.data && typeof pendingRes.data.data === 'object' && pendingRes.data.data.sessions) {
                                setPendingReviews(pendingRes.data.data.sessions || []);
                            } else {
                                setPendingReviews(pendingRes.data.data || []);
                            }
                        } else {
                            console.warn('Failed to load pending reviews:', pendingRes.data.message);
                            setPendingReviews([]);
                        }
                    } catch (pendingErr) {
                        console.error('Error fetching pending reviews:', pendingErr);
                        setPendingReviews([]);
                    }
                } else {
                    setError(reviewsRes.data.message || 'Failed to load reviews');
                    setReviews([]);
                    setPendingReviews([]);
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError(err.response?.data?.message || 'Failed to load reviews');
                setReviews([]);
                setPendingReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Render star rating
    const renderStars = (rating) => {
        const stars = [];
        
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                // Full star
                stars.push(
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else {
                // Empty star
                stars.push(
                    <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            }
        }
        
        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="reviews-page">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-indigo-800 mb-2">My Reviews</h1>
                <p className="text-gray-600">
                    Manage your reviews and ratings for tutors
                </p>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-sm underline mt-2"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Pending Reviews Section */}
            {!loading && !error && pendingReviews.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="border-b border-gray-200 p-4">
                        <h2 className="font-semibold text-lg text-indigo-800">
                            Pending Reviews ({pendingReviews.length})
                        </h2>
                        <p className="text-sm text-gray-600">
                            You have completed sessions that need your review
                        </p>
                    </div>
                    
                    <div className="p-4">
                        <div className="space-y-4">
                            {pendingReviews.map(session => (
                                <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                Session with {session.tutor?.firstName} {session.tutor?.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(session.date)}, {session.startTime} - {session.endTime}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Subject: {session.subject}
                                            </p>
                                        </div>
                                        
                                        <Link
                                            to={`/student/reviews/add/${session._id}`}
                                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                                        >
                                            Leave Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Submitted Reviews Section */}
            {!loading && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 p-4">
                        <h2 className="font-semibold text-lg text-indigo-800">
                            Your Reviews ({(reviews && Array.isArray(reviews)) ? reviews.length : 0})
                        </h2>
                    </div>
                    
                    <div className="p-4">
                        {!error && (!reviews || !Array.isArray(reviews) || reviews.length === 0) ? (
                            <div className="text-center py-10">
                                <div className="mb-4">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                                <p className="text-gray-500 mb-4">
                                    You haven't submitted any reviews for tutors yet.
                                </p>
                                {pendingReviews.length > 0 && (
                                    <p className="text-gray-500">
                                        You have {pendingReviews.length} {pendingReviews.length === 1 ? 'session' : 'sessions'} waiting for your review.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Array.isArray(reviews) && reviews.map(review => (
                                    <div key={review._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="p-5 flex flex-col md:flex-row">
                                            <div className="flex items-start space-x-4 md:w-1/3">
                                                <img 
                                                    src={review.tutor?.profilePicture || '/default-avatar.png'} 
                                                    alt={`${review.tutor?.firstName || 'Tutor'} ${review.tutor?.lastName || ''}`}
                                                    className="h-14 w-14 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {review.tutor ? `${review.tutor.firstName} ${review.tutor.lastName}` : 'Tutor'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{review.subject || review.session?.subject}</p>
                                                    <div className="flex mt-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Reviewed on {formatDate(review.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 md:w-2/3">
                                                <p className="text-gray-600">{review.reviewText}</p>
                                                <div className="mt-3 flex justify-end space-x-2">
                                                    <Link
                                                        to={`/student/reviews/edit/${review._id}`}
                                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                                                    >
                                                        Edit Review
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews; 