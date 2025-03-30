import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

const CityUsageReport = ({ dateRange }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#FBBF24', '#F97316'];

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const startDate = dateRange.startDate.toISOString().split('T')[0];
                const endDate = dateRange.endDate.toISOString().split('T')[0];
                
                const response = await axios.get(`/api/admin/reports/city-usage?startDate=${startDate}&endDate=${endDate}`);
                
                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setError('Failed to fetch city usage data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching the report');
                console.error('Error fetching city usage report:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const topCities = [...reportData].slice(0, 10);
    
    // Data for the pie chart
    const pieData = topCities.map(item => ({
        name: item.city,
        value: item.sessionCount
    }));

    // Calculate totals for summary cards
    const totalSessions = reportData.reduce((acc, item) => acc + item.sessionCount, 0);
    const totalTutors = reportData.reduce((acc, item) => acc + item.tutorCount, 0);
    const totalStudents = reportData.reduce((acc, item) => acc + item.studentCount, 0);
    const totalEarnings = reportData.reduce((acc, item) => acc + (item.totalEarnings || 0), 0);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">City Usage Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Cities</h3>
                    <p className="text-2xl font-bold">{reportData.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                    <p className="text-2xl font-bold">{totalSessions}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                    <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pie Chart for Sessions by City */}
                <div className="h-80 border border-gray-100 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Sessions by City</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart for Tutors by City */}
                <div className="h-80 border border-gray-100 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Tutors by City</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={topCities}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                                dataKey="city" 
                                type="category" 
                                tick={{ fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip />
                            <Bar dataKey="tutorCount" name="Tutors" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-medium mb-2">Data Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index} className={index < 3 ? "bg-blue-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sessionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.studentCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tutorCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(item.totalEarnings || 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CityUsageReport;
