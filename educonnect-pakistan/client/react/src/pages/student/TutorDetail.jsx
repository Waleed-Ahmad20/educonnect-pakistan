import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BookingForm from '../../components/student/BookingForm';

// Sample tutor data - in a real app, this would come from an API call
const sampleTutors = {
  101: {
    id: 101,
    name: 'Dr. Amina Khan',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    headline: 'Experienced Mathematics Tutor | PhD from LUMS',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    education: [
      { degree: 'PhD in Mathematics', institution: 'LUMS', year: '2018' },
      { degree: 'MSc in Applied Mathematics', institution: 'NUST', year: '2014' },
      { degree: 'BSc in Mathematics', institution: 'Punjab University', year: '2012' }
    ],
    hourlyRate: 2500,
    rating: 4.8,
    totalReviews: 47,
    experience: 7,
    bio: 'I am a passionate mathematics educator with 7 years of teaching experience. I specialize in calculus, linear algebra, and statistics. My teaching approach is student-centered, focusing on building a strong conceptual foundation through practical examples and problem-solving techniques. I have helped numerous students improve their grades and develop confidence in mathematics.',
    availability: [
      { day: 'Monday', slots: ['10:00 - 12:00', '14:00 - 17:00'] },
      { day: 'Wednesday', slots: ['10:00 - 12:00', '14:00 - 17:00'] },
      { day: 'Friday', slots: ['14:00 - 18:00'] },
      { day: 'Saturday', slots: ['10:00 - 15:00'] }
    ],
    teachingApproach: 'My teaching style combines theoretical concepts with practical applications. I create custom study materials for my students and provide regular practice problems. I believe in building a strong foundation and encouraging students to think critically about mathematical concepts.',
    reviews: [
      { id: 1, studentName: 'Ali Hassan', rating: 5, date: '2023-04-02', comment: 'Dr. Khan is an exceptional teacher who explained complex calculus concepts in a simple way. My grades improved significantly after her tutoring sessions.' },
      { id: 2, studentName: 'Fatima Zahra', rating: 4, date: '2023-03-15', comment: 'Very knowledgeable and patient. Helped me prepare for my final exams with great practice materials.' },
      { id: 3, studentName: 'Omar Farooq', rating: 5, date: '2023-02-20', comment: 'Absolutely the best math tutor I\'ve had. Clear explanations and always available to answer questions.' }
    ]
  },
  102: {
    id: 102,
    name: 'Ahmed Raza',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    headline: 'Physics Specialist | MSc from NUST | 5+ Years Experience',
    subjects: ['Physics', 'Mechanics', 'Electromagnetism'],
    education: [
      { degree: 'MSc in Physics', institution: 'NUST', year: '2016' },
      { degree: 'BSc in Physics', institution: 'Punjab University', year: '2014' }
    ],
    hourlyRate: 2200,
    rating: 4.6,
    totalReviews: 32,
    experience: 5,
    bio: 'I am a physics educator specializing in mechanics and electromagnetism. My approach is to break down complex physics concepts into understandable components and reinforce learning through practical demonstrations and problem-solving exercises. I have experience teaching students from high school to university level.',
    availability: [
      { day: 'Tuesday', slots: ['09:00 - 12:00', '15:00 - 18:00'] },
      { day: 'Thursday', slots: ['09:00 - 12:00', '15:00 - 18:00'] },
      { day: 'Sunday', slots: ['10:00 - 16:00'] }
    ],
    teachingApproach: 'I believe in learning by doing. My sessions include conceptual explanations followed by demonstrations and guided problem-solving. I use visual aids and interactive simulations to make physics concepts more tangible and engaging.',
    reviews: [
      { id: 1, studentName: 'Muhammad Khan', rating: 5, date: '2023-03-20', comment: 'Ahmed\'s explanations of electromagnetism were crystal clear. He uses great examples to illustrate concepts.' },
      { id: 2, studentName: 'Saima Ali', rating: 4, date: '2023-02-10', comment: 'Good tutor who knows his subject well. Sometimes moves a bit fast but is willing to repeat explanations when asked.' }
    ]
  },
  103: {
    id: 103,
    name: 'Sara Mahmood',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    headline: 'English Literature Specialist | Creative Writing Coach',
    subjects: ['English Literature', 'Creative Writing', 'Grammar and Composition'],
    education: [
      { degree: 'MA in English Literature', institution: 'GCU Lahore', year: '2017' },
      { degree: 'BA in English', institution: 'Punjab University', year: '2015' }
    ],
    hourlyRate: 1800,
    rating: 4.9,
    totalReviews: 38,
    experience: 6,
    bio: 'I am an English literature specialist with a passion for teaching literary analysis, creative writing, and critical thinking. My background includes teaching at college level and conducting writing workshops. I help students develop strong analytical and writing skills while fostering an appreciation for literature.',
    availability: [
      { day: 'Monday', slots: ['14:00 - 19:00'] },
      { day: 'Wednesday', slots: ['14:00 - 19:00'] },
      { day: 'Saturday', slots: ['10:00 - 17:00'] }
    ],
    teachingApproach: 'My teaching approach emphasizes close reading, critical analysis, and effective written expression. I guide students through textual analysis while encouraging them to develop their own interpretations and arguments. For writing, I focus on structure, clarity, and developing a unique voice.',
    reviews: [
      { id: 1, studentName: 'Ayesha Malik', rating: 5, date: '2023-04-05', comment: 'Sara helped me improve my essay writing significantly. Her feedback is thorough and constructive.' },
      { id: 2, studentName: 'Hassan Ahmed', rating: 5, date: '2023-03-12', comment: 'Excellent teacher for literature analysis. Made poetry enjoyable for the first time in my life!' },
      { id: 3, studentName: 'Zainab Khan', rating: 5, date: '2023-02-28', comment: 'Sara is patient, knowledgeable, and encouraging. My writing has improved tremendously under her guidance.' }
    ]
  }
};

const TutorDetail = () => {
    const { tutorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Fetch tutor details
    useEffect(() => {
        const fetchTutorDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/tutors/${tutorId}`);
                
                if (res.data.success) {
                    setTutor(res.data.data);
                    
                    // Check if tutor is in student's wishlist
                    if (user && user.wishlist) {
                        // Add logic here if needed
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to load tutor details');
            } finally {
                setLoading(false);
            }
        };

        // Fetch tutor reviews
        const fetchTutorReviews = async () => {
            try {
                const res = await axios.get(`/api/reviews/tutor/${tutorId}`);
                
                if (res.data.success) {
                    setReviews(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
            }
        };

        fetchTutorDetails();
        fetchTutorReviews();
    }, [tutorId]);

    // Check if tutor is in student's wishlist
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user || user.role !== 'student' || !tutorId) return;
            
            try {
                const res = await axios.get('/api/students/wishlist');
                if (res.data.success) {
                    const tutors = res.data.data.tutors || [];
                    setIsInWishlist(tutors.some(item => item._id === tutorId));
                }
            } catch (err) {
                console.error('Failed to check wishlist status:', err);
            }
        };
        
        checkWishlistStatus();
    }, [user, tutorId]);

    // Handle adding/removing from wishlist
    const handleWishlistToggle = async () => {
        try {
            setWishlistLoading(true);
            const endpoint = isInWishlist 
                ? `/api/students/wishlist/remove/${tutorId}`
                : `/api/students/wishlist/add/${tutorId}`;
            
            const res = await axios.post(endpoint);
            
            if (res.data.success) {
                setIsInWishlist(!isInWishlist);
            }
        } catch (err) {
            console.error('Wishlist toggle failed:', err);
        } finally {
            setWishlistLoading(false);
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
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                );
            } else if (i - 0.5 === roundedRating) {
                // Half star
                stars.push(
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        <path fill="white" d="M12 15.4V6.1l1.71 4.03 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                    </svg>
                );
            } else {
                // Empty star
                stars.push(
                    <svg key={i} className="w-5 h-5 text-gray-300 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                );
            }
        }
        
        return stars;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !tutor) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl text-red-600 mb-2">Error Loading Tutor Details</h2>
                <p className="text-gray-600 mb-4">{error || 'Tutor not found'}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="tutor-detail-page">
            <div className="mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Search
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                {/* Tutor Header */}
                <div className="p-6 bg-indigo-50">
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                            <img 
                                src={tutor.profilePicture || 'https://via.placeholder.com/150?text=Tutor'} 
                                alt={`${tutor.firstName} ${tutor.lastName}`}
                                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <h1 className="text-2xl font-bold text-indigo-800 mb-1">
                                    {tutor.firstName} {tutor.lastName}
                                    {tutor.isVerified && (
                                        <span className="ml-2 text-blue-500" title="Verified Tutor">
                                            <svg className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                </h1>
                                
                                <div className="mt-2 md:mt-0 flex space-x-2">
                                    <button
                                        onClick={() => setShowBookingForm(true)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Book Session
                                    </button>
                                    
                                    <button
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistLoading}
                                        className={`px-4 py-2 rounded-md transition-colors border flex items-center ${
                                            isInWishlist 
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {isInWishlist ? (
                                            <>
                                                <svg className="w-5 h-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                In Wishlist
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Add to Wishlist
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center mt-2">
                                <div className="flex">
                                    {renderStars(tutor.averageRating || 0)}
                                </div>
                                <span className="ml-2 text-gray-600">
                                    {tutor.averageRating ? tutor.averageRating.toFixed(1) : '0'} ({tutor.totalReviews || 0} reviews)
                                </span>
                            </div>
                            
                            <div className="mt-2 text-gray-600">
                                <span className="font-medium">Hourly Rate: </span>
                                <span className="text-indigo-700 font-bold">₨ {tutor.hourlyRate || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tutor Details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
                            <p className="text-gray-600 mb-6">{tutor.bio || 'No bio provided.'}</p>
                            
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Qualifications</h2>
                            {tutor.qualifications && tutor.qualifications.length > 0 ? (
                                <ul className="mb-6">
                                    {tutor.qualifications.map((qualification, index) => (
                                        <li key={index} className="mb-2 text-gray-600">
                                            <div className="font-medium">{qualification.degree}</div>
                                            <div>{qualification.institution}, {qualification.year}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600 mb-6">No qualifications listed.</p>
                            )}
                            
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Subjects</h2>
                            {tutor.subjects && tutor.subjects.length > 0 ? (
                                <div className="flex flex-wrap mb-6">
                                    {tutor.subjects.map((subject, index) => (
                                        <span 
                                            key={index} 
                                            className="mr-2 mb-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                                        >
                                            {subject.name}
                                             {/* {subject.level} */}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 mb-6">No subjects listed.</p>
                            )}
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Location & Availability</h2>
                            <div className="mb-4 text-gray-600">
                                <div className="mb-2">
                                    <span className="font-medium">Teaching Preference: </span>
                                    <span className="capitalize">
                                        {tutor.teachingPreference === 'both' 
                                            ? 'Online & In-person' 
                                            : tutor.teachingPreference || 'Not specified'}
                                    </span>
                                </div>
                                
                                {tutor.location && tutor.location.city && (
                                    <div className="mb-2">
                                        <span className="font-medium">Location: </span>
                                        {tutor.location.city}
                                        {tutor.location.address && `, ${tutor.location.address}`}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-medium text-gray-700 mb-2">Available on:</h3>
                            {tutor.availability && tutor.availability.length > 0 ? (
                                <div className="mb-6">
                                    {tutor.availability.map((avail, dayIndex) => (
                                        <div key={dayIndex} className="mb-2">
                                            <div className="capitalize font-medium text-indigo-700">{avail.day}:</div>
                                            {avail.slots && avail.slots.length > 0 ? (
                                                <div className="ml-4">
                                                    {avail.slots.map((slot, slotIndex) => (
                                                        <div key={slotIndex} className="text-gray-600">
                                                            {slot.startTime} - {slot.endTime}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="ml-4 text-gray-600">No specific time slots</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 mb-6">No availability information.</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Reviews Section */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Reviews ({reviews.length})
                        </h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review._id} className="border-b border-gray-200 pb-4">
                                        <div className="flex items-center mb-2">
                                            <div className="font-medium">{review.student.firstName} {review.student.lastName}</div>
                                            <span className="mx-2 text-gray-300">•</span>
                                            <div className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex mb-2">
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No reviews yet.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Booking Form Modal */}
            {showBookingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Book a Session</h2>
                                <button 
                                    onClick={() => setShowBookingForm(false)} 
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <BookingForm 
                                tutor={tutor} 
                                onSuccess={() => {
                                    navigate('/student/sessions');
                                    setShowBookingForm(false);
                                }}
                                onCancel={() => setShowBookingForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorDetail;