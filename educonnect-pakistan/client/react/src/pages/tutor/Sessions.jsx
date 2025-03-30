import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SessionManagement from '../../components/tutor/SessionManagement';
import { Link } from 'react-router-dom';

const TutorSessions = () => {
    const [sessionStats, setSessionStats] = useState({
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch session statistics
    useEffect(() => {
        const fetchSessionStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/sessions/tutor/stats');
                
                if (res.data.success) {
                    setSessionStats(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching session stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionStats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">My Sessions</h1>
                <p className="text-gray-600">Manage your tutoring sessions and availability</p>
            </header>
            
            {/* Session Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">Upcoming Sessions</h3>
                    <p className="text-2xl font-bold">{loading ? '...' : sessionStats.upcoming}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500">Completed Sessions</h3>
                    <p className="text-2xl font-bold">{loading ? '...' : sessionStats.completed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                    <h3 className="text-sm font-medium text-gray-500">Cancelled Sessions</h3>
                    <p className="text-2xl font-bold">{loading ? '...' : sessionStats.cancelled}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                    <p className="text-2xl font-bold">{loading ? '...' : sessionStats.total}</p>
                </div>
            </div>
            
            {/* Quick Actions */}
            {/* <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 md:mb-0">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <Link 
                            to="/tutor/availability" 
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                        >
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Manage Availability
                            </span>
                        </Link>
                        <Link 
                            to="/tutor/earnings" 
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View Earnings
                            </span>
                        </Link>
                        <Link 
                            to="/tutor/reviews" 
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                        >
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                My Reviews
                            </span>
                        </Link>
                    </div>
                </div>
            </div> */}
            
            {/* Session Management Component */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <SessionManagement />
            </div>
        </div>
    );
};

export default TutorSessions;
