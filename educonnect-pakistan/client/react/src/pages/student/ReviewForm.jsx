import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReviewForm = () => {
    const { sessionId, reviewId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Check if this is an edit operation
                if (reviewId) {
                    setIsEditing(true);
                    const reviewRes = await axios.get(`/api/reviews/${reviewId}`);
                    if (reviewRes.data.success) {
                        const review = reviewRes.data.data;
                        setFormData({
                            rating: review.rating,
                            comment: review.comment
                        });
                        setSessionData({
                            tutor: review.tutor,
                            subject: review.session.subject,
                            date: review.session.date
                        });
                    }
                } 
                // This is a new review
                else if (sessionId) {
                    const sessionRes = await axios.get(`/api/sessions/${sessionId}`);
                    if (sessionRes.data.success) {
                        setSessionData(sessionRes.data.data);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId, reviewId]);

    const handleRatingChange = (newRating) => {
        setFormData({
            ...formData,
            rating: newRating
        });
    };

    const handleCommentChange = (e) => {
        setFormData({
            ...formData,
            comment: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let response;
            
            if (isEditing) {
                response = await axios.put(`/api/reviews/${reviewId}`, formData);
            } else {
                response = await axios.post('/api/reviews', {
                    ...formData,
                    sessionId
                });
            }
            
            if (response.data.success) {
                navigate('/student/reviews');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        }
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

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/student/reviews')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Go Back to Reviews
                </button>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-yellow-600 mb-4">Session not found or no longer available for review.</p>
                <button
                    onClick={() => navigate('/student/reviews')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Go Back to Reviews
                </button>
            </div>
        );
    }

    return (
        <div className="review-form-page">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-indigo-800 mb-2">
                    {isEditing ? 'Edit Review' : 'Leave a Review'}
                </h1>
                <p className="text-gray-600">
                    {isEditing ? 'Update your review and rating' : 'Share your experience with this tutor'}
                </p>
            </header>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4">
                    <div className="flex flex-col">
                        <h2 className="font-semibold text-lg text-gray-800">
                            {sessionData.tutor.firstName} {sessionData.tutor.lastName}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {sessionData.subject}, {formatDate(sessionData.date)}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Rating
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(star)}
                                    className="focus:outline-none"
                                >
                                    <svg 
                                        className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                        fill="currentColor" 
                                        viewBox="0 0 20 20" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                            <span className="ml-2 text-lg font-medium text-gray-700">
                                {formData.rating}/5
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-gray-700 text-sm font-medium mb-2">
                            Your Review
                        </label>
                        <textarea
                            id="comment"
                            rows="5"
                            value={formData.comment}
                            onChange={handleCommentChange}
                            placeholder="Share details of your experience with this tutor..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/student/reviews')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            {isEditing ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm; 