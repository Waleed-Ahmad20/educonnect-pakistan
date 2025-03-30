import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const localizer = momentLocalizer(moment);

const SessionManagement = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCalendarView, setShowCalendarView] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [sessionToAction, setSessionToAction] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get('/api/sessions/tutor');
            if (res.data.success) {
                const formattedSessions = res.data.data.map(session => ({
                    ...session,
                    start: new Date(session.date + 'T' + session.startTime),
                    end: new Date(session.date + 'T' + session.endTime),
                    title: `${session.subject} with ${session.student?.firstName} ${session.student?.lastName}`,
                }));
                setSessions(formattedSessions);
            } else {
                setError(res.data.message || 'Failed to load sessions');
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(session => {
        if (!session || !session.date) return false;
        
        const sessionDate = new Date(session.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (activeTab === 'upcoming') {
            return (sessionDate >= today && session.status !== 'cancelled' && 
                   session.status !== 'completed' && session.status !== 'rejected');
        } else if (activeTab === 'past') {
            return sessionDate < today || session.status === 'completed';
        } else if (activeTab === 'cancelled') {
            return session.status === 'cancelled' || session.status === 'rejected';
        }
        return true;
    });

    const groupedSessions = filteredSessions.reduce((groups, session) => {
        const date = new Date(session.date).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(session);
        return groups;
    }, {});

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const handleAcceptSession = async (sessionId) => {
        try {
            const res = await axios.patch(`/api/sessions/${sessionId}/status`, {
                status: 'upcoming'
            });
            if (res.data.success) {
                fetchSessions();
                toast.success('Session accepted successfully!');
            } else {
                toast.error(res.data.message || 'Failed to accept session');
            }
        } catch (err) {
            console.error('Failed to accept session:', err);
            toast.error(err.response?.data?.message || 'Failed to accept session');
        }
    };

    const handleRejectSession = async () => {
        if (!sessionToAction) return;
        
        try {
            const res = await axios.patch(`/api/sessions/${sessionToAction._id}/status`, {
                status: 'rejected',
                reason: 'Rejected by tutor'
            });
            if (res.data.success) {
                fetchSessions();
                toast.success('Session rejected successfully');
            } else {
                toast.error(res.data.message || 'Failed to reject session');
            }
        } catch (err) {
            console.error('Failed to reject session:', err);
            toast.error(err.response?.data?.message || 'Failed to reject session');
        } finally {
            setConfirmAction(null);
            setSessionToAction(null);
        }
    };

    const handleCancelSession = async () => {
        if (!sessionToAction) return;
        
        try {
            const res = await axios.patch(`/api/sessions/${sessionToAction._id}/status`, {
                status: 'cancelled',
                reason: 'Cancelled by tutor'
            });
            if (res.data.success) {
                fetchSessions();
                toast.success('Session cancelled successfully');
            } else {
                toast.error(res.data.message || 'Failed to cancel session');
            }
        } catch (err) {
            console.error('Failed to cancel session:', err);
            toast.error(err.response?.data?.message || 'Failed to cancel session');
        } finally {
            setConfirmAction(null);
            setSessionToAction(null);
        }
    };

    const handleMarkComplete = async () => {
        if (!sessionToAction) return;
        
        try {
            const res = await axios.patch(`/api/sessions/${sessionToAction._id}/status`, {
                status: 'completed'
            });
            if (res.data.success) {
                fetchSessions();
                toast.success('Session marked as completed!');
            } else {
                toast.error(res.data.message || 'Failed to mark session as complete');
            }
        } catch (err) {
            console.error('Failed to mark session as complete:', err);
            toast.error(err.response?.data?.message || 'Failed to mark session as complete');
        } finally {
            setConfirmAction(null);
            setSessionToAction(null);
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        if (!sessionToAction) return;
        
        try {
            const res = await axios.put(`/api/sessions/${sessionToAction._id}`, {
                date: rescheduleData.date,
                startTime: rescheduleData.startTime,
                endTime: rescheduleData.endTime
            });
            if (res.data.success) {
                fetchSessions();
                toast.success('Session rescheduled successfully!');
                setShowRescheduleModal(false);
            } else {
                toast.error(res.data.message || 'Failed to reschedule session');
            }
        } catch (err) {
            console.error('Failed to reschedule session:', err);
            toast.error(err.response?.data?.message || 'Failed to reschedule session');
        }
    };

    const openConfirmDialog = (action, session) => {
        setConfirmAction(action);
        setSessionToAction(session);
    };

    const openRescheduleModal = (session) => {
        setSessionToAction(session);
        setRescheduleData({
            date: session.date.split('T')[0],
            startTime: session.startTime,
            endTime: session.endTime
        });
        setShowRescheduleModal(true);
    };

    const renderConfirmDialog = () => {
        if (!confirmAction || !sessionToAction) return null;

        let title, message, confirmText, actionHandler;
        
        switch (confirmAction) {
            case 'reject':
                title = 'Reject Session';
                message = `Are you sure you want to reject the session "${sessionToAction.subject}" with ${sessionToAction.student?.firstName}?`;
                confirmText = 'Reject';
                actionHandler = handleRejectSession;
                break;
            case 'cancel':
                title = 'Cancel Session';
                message = `Are you sure you want to cancel the session "${sessionToAction.subject}" with ${sessionToAction.student?.firstName}?`;
                confirmText = 'Cancel';
                actionHandler = handleCancelSession;
                break;
            case 'complete':
                title = 'Mark as Complete';
                message = `Are you sure this session "${sessionToAction.subject}" with ${sessionToAction.student?.firstName} is completed?`;
                confirmText = 'Mark Complete';
                actionHandler = handleMarkComplete;
                break;
            default:
                return null;
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={() => {
                                setConfirmAction(null);
                                setSessionToAction(null);
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={actionHandler}
                            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRescheduleModal = () => {
        if (!showRescheduleModal || !sessionToAction) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Reschedule Session</h3>
                        <button 
                            onClick={() => setShowRescheduleModal(false)} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleReschedule}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={rescheduleData.date}
                                onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startTime">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={rescheduleData.startTime}
                                    onChange={(e) => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endTime">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    value={rescheduleData.endTime}
                                    onChange={(e) => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                type="button"
                                onClick={() => setShowRescheduleModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                            >
                                Reschedule
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
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
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={fetchSessions}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="session-management">
            {renderConfirmDialog()}
            {renderRescheduleModal()}
            
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
            
            <div className="p-4">
                {filteredSessions.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions found</h3>
                        <p className="text-gray-500 mb-4">
                            {activeTab === 'upcoming' 
                                ? "You don't have any upcoming sessions."
                                : activeTab === 'past' 
                                ? "You don't have any past sessions."
                                : "You don't have any cancelled sessions."}
                        </p>
                    </div>
                ) : showCalendarView ? (
                    <div className="mb-6">
                        <Calendar
                            localizer={localizer}
                            events={filteredSessions}
                            startAccessor="start"
                            endAccessor="end"
                            titleAccessor="title"
                            style={{ height: 600 }}
                            eventPropGetter={(event) => {
                                let backgroundColor = '#3174ad';
                                if (event.status === 'pending') {
                                    backgroundColor = '#ffc107';
                                } else if (event.status === 'completed') {
                                    backgroundColor = '#28a745';
                                } else if (event.status === 'rejected' || event.status === 'cancelled') {
                                    backgroundColor = '#dc3545';
                                } else if (event.status === 'upcoming') {
                                    backgroundColor = '#0d6efd';
                                }
                                return {
                                    style: { backgroundColor }
                                };
                            }}
                        />
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
                                                        {session.subject}: {session.topic || "General Session"}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        With {session.student?.firstName} {session.student?.lastName}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                                        </span>
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                            {session.type}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {session.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAcceptSession(session._id)}
                                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => openConfirmDialog('reject', session)}
                                                                    className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded hover:bg-red-100 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {session.status === 'upcoming' && (
                                                            <>
                                                                {session.type === 'online' && (
                                                                    <a
                                                                        href={session.meetingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                                                                    >
                                                                        Join Session
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => openRescheduleModal(session)}
                                                                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded hover:bg-blue-100 transition-colors"
                                                                >
                                                                    Reschedule
                                                                </button>
                                                                <button
                                                                    onClick={() => openConfirmDialog('complete', session)}
                                                                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded hover:bg-green-100 transition-colors"
                                                                >
                                                                    Mark Complete
                                                                </button>
                                                                <button
                                                                    onClick={() => openConfirmDialog('cancel', session)}
                                                                    className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded hover:bg-red-100 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
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
    );
};

export default SessionManagement;
