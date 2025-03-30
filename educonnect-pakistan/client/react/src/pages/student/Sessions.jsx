import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SessionCard from '../../components/student/SessionCard';
import { Link } from 'react-router-dom';

const Sessions = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCalendarView, setShowCalendarView] = useState(false);

    // Fetch sessions from API
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get('/api/sessions/student');
                
                if (res.data.success) {
                    // Check if data is nested or direct array
                    if (res.data.data && typeof res.data.data === 'object' && res.data.data.sessions) {
                        setSessions(res.data.data.sessions || []);
                    } else {
                        setSessions(res.data.data || []);
                    }
                } else {
                    setError(res.data.message || 'Failed to load sessions');
                    setSessions([]);
                }
            } catch (err) {
                console.error('Error fetching sessions:', err);
                // Check if it's a validation error for session ID
                if (err.response?.status === 400 && err.response?.data?.message?.includes('session ID')) {
                    setError('Invalid session ID format. Please contact support.');
                } else {
                    setError(err.response?.data?.message || 'Failed to load sessions');
                }
                
                // Set empty array to avoid undefined errors
                setSessions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // Handle session cancellation
    const handleCancelSession = async (sessionId) => {
        try {
            const res = await axios.patch(`/api/sessions/${sessionId}/cancel`);
            
            if (res.data.success) {
                // Update sessions state
                setSessions(prevSessions => 
                    prevSessions.map(session => 
                        session._id === sessionId 
                            ? { ...session, status: 'cancelled' } 
                            : session
                    )
                );
            }
        } catch (err) {
            console.error('Failed to cancel session:', err);
            // Maybe show an error toast or message here
        }
    };

    // Filter sessions based on active tab
    const filteredSessions = sessions.filter(session => {
        if (!session || !session.date) return false;
        
        const sessionDate = new Date(session.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (activeTab === 'upcoming') {
            return sessionDate >= today && session.status !== 'cancelled';
        } else if (activeTab === 'past') {
            return sessionDate < today || session.status === 'completed';
        } else if (activeTab === 'cancelled') {
            return session.status === 'cancelled';
        }
        
        return true;
    });

    // Group sessions by date for calendar view
    const groupedSessions = filteredSessions.reduce((groups, session) => {
        const date = new Date(session.date).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(session);
        return groups;
    }, {});

    // Format date for display
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Format time for display
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="sessions-page">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-indigo-800 mb-2">My Sessions</h1>
                <p className="text-gray-600">Manage your booked tutoring sessions</p>
            </header>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                {/* Tabs & View Toggle */}
                <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                    <div className="flex space-x-4">
                        <button
                            className={`px-3 py-2 font-medium rounded-md ${
                                activeTab === 'upcoming' 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'text-gray-600 hover:text-indigo-800'
                            }`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`px-3 py-2 font-medium rounded-md ${
                                activeTab === 'past' 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'text-gray-600 hover:text-indigo-800'
                            }`}
                            onClick={() => setActiveTab('past')}
                        >
                            Past
                        </button>
                        <button
                            className={`px-3 py-2 font-medium rounded-md ${
                                activeTab === 'cancelled' 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'text-gray-600 hover:text-indigo-800'
                            }`}
                            onClick={() => setActiveTab('cancelled')}
                        >
                            Cancelled
                        </button>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                            className={`p-2 rounded-md ${
                                !showCalendarView ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600'
                            }`}
                            onClick={() => setShowCalendarView(false)}
                            title="List View"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            className={`p-2 rounded-md ${
                                showCalendarView ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600'
                            }`}
                            onClick={() => setShowCalendarView(true)}
                            title="Calendar View"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sessions Container */}
                <div className="p-4">
                    {error && (
                        <div className="text-center py-4 text-red-600">
                            {error}
                        </div>
                    )}

                    {!error && filteredSessions.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="mb-4">
                                <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions found</h3>
                            <p className="text-gray-500 mb-4">
                                {activeTab === 'upcoming' 
                                    ? "You don't have any upcoming sessions booked."
                                    : activeTab === 'past' 
                                    ? "You don't have any past sessions."
                                    : "You don't have any cancelled sessions."}
                            </p>
                            {activeTab === 'upcoming' && (
                                <Link to="/student/find-tutors" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                    Find Tutors
                                </Link>
                            )}
                        </div>
                    ) : !showCalendarView ? (
                        <div className="space-y-6">
                            {filteredSessions.map(session => (
                                <SessionCard 
                                    key={session._id}
                                    session={session}
                                    onCancel={() => handleCancelSession(session._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(groupedSessions).sort((a, b) => new Date(a) - new Date(b)).map(date => (
                                <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-indigo-50 border-b border-gray-200 px-4 py-3">
                                        <h3 className="font-medium text-indigo-800">
                                            {formatDate(new Date(date))}
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-4">
                                            {groupedSessions[date].map(session => (
                                                <div key={session._id} className="flex border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-indigo-100 flex-none w-24 p-4 flex flex-col items-center justify-center">
                                                        <div className="text-lg font-bold text-indigo-800">
                                                            {formatTime(session.startTime)}
                                                        </div>
                                                        <div className="text-sm text-indigo-600">
                                                            {formatTime(session.endTime)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow p-4">
                                                        <h4 className="font-medium text-gray-800 mb-1">
                                                            {session.subject}: {session.topic}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            With {session.tutor?.firstName} {session.tutor?.lastName}
                                                        </p>
                                                        <div className="mt-2 flex space-x-2">
                                                            {session.status === 'upcoming' && (
                                                                <>
                                                                    <a
                                                                        href={session.meetingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                                                                    >
                                                                        Join Session
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleCancelSession(session._id)}
                                                                        className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded hover:bg-red-100 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {session.status === 'completed' && !session.isReviewed && (
                                                                <Link
                                                                    to={`/student/reviews/add/${session._id}`}
                                                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 transition-colors"
                                                                >
                                                                    Leave Review
                                                                </Link>
                                                            )}
                                                            {session.status === 'cancelled' && (
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                                                                    Cancelled
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sessions; 