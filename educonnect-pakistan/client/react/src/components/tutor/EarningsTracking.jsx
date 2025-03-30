import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EarningsTracking = () => {
    const { user } = useAuth();
    const [earnings, setEarnings] = useState({
        perSession: 0,
        weekly: 0,
        monthly: 0,
        paymentStatus: 'pending'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get('/api/tutors/earnings');
                if (res.data.success) {
                    setEarnings(res.data.data);
                } else {
                    setError(res.data.message || 'Failed to load earnings');
                }
            } catch (err) {
                console.error('Error fetching earnings:', err);
                setError(err.response?.data?.message || 'Failed to load earnings');
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) {
        return <div className="text-center">Loading earnings...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="earnings-tracking bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Earnings Tracking</h2>
                <p className="text-sm text-gray-600">Track your earnings from tutoring sessions</p>
            </div>
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-700">Earnings per Session:</h3>
                    <p className="text-gray-600">Rs.{earnings.perSession}</p>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-700">Weekly Earnings:</h3>
                    <p className="text-gray-600">Rs.{earnings.weekly}</p>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold text-gray-700">Monthly Earnings:</h3>
                    <p className="text-gray-600">Rs.{earnings.monthly}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Payment Status:</h3>
                    <p className="text-gray-600">{earnings.paymentStatus}</p>
                </div>
            </div>
        </div>
    );
};

export default EarningsTracking;
