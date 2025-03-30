import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TutorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        totalEarnings: 0,
        pendingPayments: 0,
        averageRating: 0
    });
    const [isVerified, setIsVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [verificationComments, setVerificationComments] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentSessions, setRecentSessions] = useState([]);
    const [apiErrors, setApiErrors] = useState({});
    const [retryCounter, setRetryCounter] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Pass the auth header so the server recognizes the tutor
                const config = {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    timeout: 10000
                };

                // Track promises for all API calls
                const promises = [];
                const errors = {};
                
                // Fetch verification status
                const verificationPromise = axios.get('/api/tutors/verification-status', config)
                    .then(response => {
                        if (response.data.success) {
                            setIsVerified(response.data.data.isVerified);
                            setVerificationStatus(response.data.data.status);
                            setVerificationComments(response.data.data.comments || '');
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching verification status:', err);
                        errors.verification = err.message || 'Failed to fetch verification status';
                        // Use a default status if API fails
                        setVerificationStatus('not_submitted');
                        setIsVerified(false);
                        setApiErrors(prev => ({
                            ...prev,
                            verification: true
                        }));
                    });
                promises.push(verificationPromise);
                
                // Fetch recent sessions
                const sessionsPromise = axios.get('/api/sessions/tutor', { 
                    params: { limit: 5 }, 
                    ...config
                })
                    .then(response => {
                        if (response.data.success) {
                            setRecentSessions(response.data.data || []);
                            
                            // Calculate stats from sessions
                            const allSessions = response.data.data || [];
                            const completed = allSessions.filter(session => session.status === 'completed');
                            const upcoming = allSessions.filter(session => session.status === 'upcoming');
                            
                            setStats(prev => ({
                                ...prev,
                                totalSessions: allSessions.length,
                                completedSessions: completed.length,
                                upcomingSessions: upcoming.length
                            }));
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching sessions:', err);
                        errors.sessions = err.message || 'Failed to fetch sessions';
                        setApiErrors(prev => ({ ...prev, sessions: true }));
                        // Use empty array as fallback
                        setRecentSessions([]);
                    });
                promises.push(sessionsPromise);
                
                // Fetch earnings info
                const earningsPromise = axios.get('/api/tutors/earnings', config)
                    .then(response => {
                        if (response.data.success) {
                            setStats(prev => ({
                                ...prev,
                                totalEarnings: response.data.data.totalEarnings || 0,
                                pendingPayments: response.data.data.pendingPayments || 0
                            }));
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching earnings:', err);
                        errors.earnings = err.message || 'Failed to fetch earnings data';
                        setApiErrors(prev => ({ ...prev, earnings: true }));
                    });
                promises.push(earningsPromise);
                
                // Wait for all promises to settle, regardless of success or failure
                await Promise.allSettled(promises);
                
                // Update API errors state if any occurred
                if (Object.keys(errors).length > 0) {
                    setError('Some dashboard components failed to load. Please retry loading the data.');
                }
                
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please refresh to try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [retryCounter]);

    // Handle retry button click
    const handleRetry = () => {
        setRetryCounter(prev => prev + 1);
        setApiErrors({});
        setError(null);
    };

    // Chart data for sessions
    const sessionChartData = {
        labels: ['Completed', 'Upcoming', 'Cancelled'],
        datasets: [
            {
                data: [stats.completedSessions, stats.upcomingSessions, stats.totalSessions - stats.completedSessions - stats.upcomingSessions],
                backgroundColor: ['#4F46E5', '#3B82F6', '#EF4444'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <div className="w-full p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Tutor Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName || 'Tutor'}! Here's an overview of your tutoring activities.</p>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-center">
                        <p>{error}</p>
                        <button 
                            onClick={handleRetry} 
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </header>

            {!apiErrors.verification && !isVerified ? (
                <div className={`mb-6 p-4 rounded-lg border ${
                    verificationStatus === 'pending' 
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : verificationStatus === 'rejected'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : verificationStatus === 'not_submitted'
                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}>
                    <h3 className="font-semibold mb-2">
                        {verificationStatus === 'pending' 
                            ? '⚠️ Verification Pending' 
                            : verificationStatus === 'rejected'
                                ? '❌ Verification Rejected'
                                : verificationStatus === 'not_submitted'
                                    ? '📝 Verification Required'
                                    : '⚠️ Verification Status'}
                    </h3>
                    <p className="text-sm">
                        {verificationStatus === 'pending' 
                            ? 'Your verification is pending review by our team. You\'ll be notified once it\'s approved.'
                            : verificationStatus === 'rejected'
                                ? `Your verification was rejected. Reason: ${verificationComments || 'No reason provided'}`
                                : verificationStatus === 'not_submitted'
                                    ? 'You need to submit your documents for verification before you can start tutoring.'
                                    : 'Please check your verification status.'}
                    </p>
                    {(verificationStatus === 'not_submitted' || verificationStatus === 'rejected') && (
                        <Link to="/tutor/verification" className="mt-2 inline-block px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                            Submit Documents
                        </Link>
                    )}
                </div>
            ) : apiErrors.verification ? (
                <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                    <h3 className="font-semibold mb-2">📝 Verification Status</h3>
                    <p className="text-sm">Unable to load verification status. Please check your profile section for details.</p>
                    <Link to="/profile" className="mt-2 inline-block px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                        Go to Profile
                    </Link>
                </div>
            ) : null}

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Sessions Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Sessions</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalSessions}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Upcoming</p>
                                <p className="text-2xl font-bold text-primary-600">{stats.upcomingSessions}</p>
                            </div>
                        </div>
                        <Link to="/tutor/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Manage Sessions →
                        </Link>
                    </div>
                </div>

                {/* Earnings Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Earnings</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {apiErrors.earnings ? "---" : `₨ ${stats.totalEarnings}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {apiErrors.earnings ? "---" : `₨ ${stats.pendingPayments}`}
                                </p>
                            </div>
                        </div>
                        <Link to="/tutor/earnings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View Earnings →
                        </Link>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">My Profile</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Rating</p>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                        <svg key={index} className={`w-5 h-5 ${
                                            index < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                                        }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className={`text-xl font-medium ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                    {isVerified ? 'Verified' : 'Pending'}
                                </p>
                            </div>
                        </div>
                        <Link to="/profile" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Edit Profile →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Session Data and Recent Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Session Chart */}
                {!apiErrors.sessions && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-5 bg-primary-50 border-b border-primary-100">
                            <h3 className="text-lg font-semibold text-primary-800">Session Overview</h3>
                        </div>
                        <div className="p-5 flex flex-col items-center">
                            <div className="w-48 h-48 mx-auto">
                                <Doughnut 
                                    data={sessionChartData}
                                    options={{
                                        cutout: '70%',
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">Completion Rate</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {stats.totalSessions > 0 
                                        ? `${Math.round((stats.completedSessions / stats.totalSessions) * 100)}%`
                                        : '0%'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Sessions */}
                <div className={`${!apiErrors.sessions ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden`}>
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Recent Sessions</h3>
                    </div>
                    <div className="p-5">
                        {apiErrors.sessions ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500 mb-3">Failed to load recent sessions</p>
                                <button 
                                    onClick={handleRetry}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        ) : recentSessions.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {recentSessions.map(session => (
                                    <li key={session._id} className="py-3">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">{session.subject}</p>
                                                <p className="text-sm text-gray-500">
                                                    with {session.student?.firstName} {session.student?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                    session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(session.date)}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No recent sessions found</p>
                            </div>
                        )}
                        {recentSessions.length > 0 && (
                            <div className="mt-4">
                                <Link to="/tutor/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    View All Sessions →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
