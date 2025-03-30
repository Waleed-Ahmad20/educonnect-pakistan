import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const VerificationStats = () => {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        additional_info_requested: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/admin/verification-stats');
                if (res.data.success) {
                    setStats(res.data.data);
                } else {
                    setError('Failed to load verification statistics');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load verification statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Prepare data for pie chart
    const chartData = [
        { name: 'Pending', value: stats.pending, color: '#FCD34D' },
        { name: 'Approved', value: stats.approved, color: '#10B981' },
        { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
        { name: 'Additional Info', value: stats.additional_info_requested, color: '#8B5CF6' }
    ];

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Verification Statistics</h1>
                <p className="text-gray-600">Overview of tutor verification status on the platform</p>
            </header>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
                        <h3 className="font-semibold text-yellow-800">Pending</h3>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded shadow">
                        <h3 className="font-semibold text-green-800">Approved</h3>
                        <p className="text-2xl font-bold">{stats.approved}</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow">
                        <h3 className="font-semibold text-red-800">Rejected</h3>
                        <p className="text-2xl font-bold">{stats.rejected}</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded shadow">
                        <h3 className="font-semibold text-purple-800">Additional Info</h3>
                        <p className="text-2xl font-bold">{stats.additional_info_requested}</p>
                    </div>
                </div>
            )}

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold mb-4">Verification Status Distribution</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Tutors']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default VerificationStats;
