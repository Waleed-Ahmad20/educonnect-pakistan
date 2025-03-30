import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const VerificationStats = () => {
    const [stats, setStats] = useState({
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        additional_info_requested: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVerificationStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/admin/verification-stats');
                
                if (res.data.success) {
                    setStats(res.data.data);
                } else {
                    setError(res.data.message || 'Failed to load verification statistics');
                }
            } catch (err) {
                console.error('Error fetching verification stats:', err);
                setError(err.response?.data?.message || 'Failed to load verification statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationStats();
    }, []);

    const chartData = {
        labels: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Info Requested'],
        datasets: [
            {
                data: [
                    stats.pending,
                    stats.under_review,
                    stats.approved,
                    stats.rejected,
                    stats.additional_info_requested
                ],
                backgroundColor: [
                    '#FBBF24', // Amber for pending
                    '#3B82F6', // Blue for under review
                    '#10B981', // Green for approved
                    '#EF4444', // Red for rejected
                    '#8B5CF6'  // Purple for additional info
                ],
                borderWidth: 0,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Tutor Verification Statistics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="flex justify-center">
                    <div style={{ height: '300px', width: '300px' }}>
                        <Doughnut 
                            data={chartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-sm text-yellow-600">Pending</div>
                        <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
                        <div className="text-xs text-yellow-600 mt-1">
                            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600">Under Review</div>
                        <div className="text-2xl font-bold text-blue-800">{stats.under_review}</div>
                        <div className="text-xs text-blue-600 mt-1">
                            {stats.total > 0 ? Math.round((stats.under_review / stats.total) * 100) : 0}% of total
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600">Approved</div>
                        <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
                        <div className="text-xs text-green-600 mt-1">
                            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
                        </div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-sm text-red-600">Rejected</div>
                        <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
                        <div className="text-xs text-red-600 mt-1">
                            {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% of total
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationStats;
