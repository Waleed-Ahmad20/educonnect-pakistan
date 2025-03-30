import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTutors: 0,
        totalStudents: 0,
        totalSessions: 0,
        pendingVerifications: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Add console logs for debugging
                console.log('Fetching admin stats...');
                
                const res = await axios.get('/api/admin/stats');
                
                console.log('Admin stats response:', res.data);
                
                if (res.data.success) {
                    setStats(res.data.data);
                } else {
                    throw new Error(res.data.message || 'Failed to load admin statistics');
                }
            } catch (err) {
                console.error('Error fetching admin stats:', err);
                
                // More detailed error logging
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Error response data:', err.response.data);
                    console.error('Error response status:', err.response.status);
                } else if (err.request) {
                    // The request was made but no response was received
                    console.error('No response received:', err.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error message:', err.message);
                }
                
                setError(err.response?.data?.message || err.message || 'Failed to load admin statistics. Please try again later.');
                
                // Set default values to avoid UI errors
                setStats({
                    totalUsers: 0,
                    totalTutors: 0,
                    totalStudents: 0,
                    totalSessions: 0,
                    pendingVerifications: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    // Add fallback component if user is not authenticated or lacks permissions
    if (!user || !user.role || user.role !== 'admin') {
        return (
            <div className="w-full p-6 bg-gray-50 rounded-lg">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    You do not have permission to access the admin dashboard.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                <p className="ml-3 text-primary-600">Loading dashboard data...</p>
            </div>
        );
    }

    // Add a check to render a proper message if stats is undefined
    if (!stats) {
        return (
            <div className="w-full p-6 bg-gray-50 rounded-lg">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
                    Unable to load dashboard statistics. Please refresh the page or try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.firstName || 'Admin'}! Manage platform operations and view insights.</p>
                {error && (
                    <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
                        {error}
                    </div>
                )}
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Total Users</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Total Tutors</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalTutors}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Total Students</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalStudents}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalSessions}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Pending Verifications</div>
                    <div className="text-2xl font-bold text-primary-600">{stats.pendingVerifications}</div>
                </div>
            </div>

            {/* Admin Functions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Verification Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">Tutor Verification</h3>
                        <p className="text-sm text-gray-600">Review and approve tutor verification requests</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            {stats.pendingVerifications} tutors waiting for verification. Review their credentials and approve qualified tutors.
                        </p>
                        <Link to="/admin/verification" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            Manage Verifications
                        </Link>
                    </div>
                </div>

                {/* Reports Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">Platform Reports</h3>
                        <p className="text-sm text-gray-600">View analytics and generate reports</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            Access detailed reports on platform usage, popular subjects, user growth, and more.
                        </p>
                        <Link to="/admin/reports" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            View Reports
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
