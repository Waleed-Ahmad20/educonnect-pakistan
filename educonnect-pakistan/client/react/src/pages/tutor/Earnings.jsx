import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import EarningsTracking from '../../components/tutor/EarningsTracking';

const TutorEarnings = () => {
    const { user } = useAuth();
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        pendingPayments: 0,
        completedSessions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const config = {
                    headers: { Authorization: `Bearer ${user?.token}` }
                };

                const response = await axios.get('/api/tutors/earnings', config);
                
                if (response.data.success) {
                    setEarnings(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to load earnings data');
                }
            } catch (err) {
                console.error('Error fetching earnings data:', err);
                setError(err.response?.data?.message || 'Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
    }, [user]);

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
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Earnings Dashboard</h1>
                <p className="text-gray-600">Track your earnings and payment status.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Earnings Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Total Earnings</h3>
                    </div>
                    <div className="p-5 flex flex-col items-center">
                        <p className="text-3xl font-bold text-gray-800">₨ {earnings.totalEarnings}</p>
                        <p className="text-sm text-gray-500 mt-2">Lifetime earnings</p>
                    </div>
                </div>

                {/* Pending Payments Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Pending Payments</h3>
                    </div>
                    <div className="p-5 flex flex-col items-center">
                        <p className="text-3xl font-bold text-amber-600">₨ {earnings.pendingPayments}</p>
                        <p className="text-sm text-gray-500 mt-2">Awaiting processing</p>
                    </div>
                </div>

                {/* Sessions Completed Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800">Sessions Completed</h3>
                    </div>
                    <div className="p-5 flex flex-col items-center">
                        <p className="text-3xl font-bold text-primary-600">{earnings.completedSessions}</p>
                        <p className="text-sm text-gray-500 mt-2">Total paid sessions</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <EarningsTracking />
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default TutorEarnings;
