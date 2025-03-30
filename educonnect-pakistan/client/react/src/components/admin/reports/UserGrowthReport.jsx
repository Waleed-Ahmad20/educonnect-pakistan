import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

const UserGrowthReport = ({ dateRange }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const startDate = dateRange.startDate.toISOString().split('T')[0];
                const endDate = dateRange.endDate.toISOString().split('T')[0];
                
                const response = await axios.get(`/api/admin/reports/user-growth?startDate=${startDate}&endDate=${endDate}`);
                
                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setError('Failed to fetch report data');
                }
            } catch (err) {
                console.error('Error fetching user growth report:', err);
                if (err.response) {
                    setError(err.response.data?.message || 'An error occurred while fetching the report');
                } else {
                    setError('Network error. Please check your connection.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">User Growth Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">New Users</h3>
                    <p className="text-2xl font-bold">
                        {reportData.reduce((acc, item) => acc + item.newStudents + item.newTutors, 0)}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-2xl font-bold">
                        {reportData.length > 0 ? 
                            reportData[reportData.length - 1].totalStudents + reportData[reportData.length - 1].totalTutors : 0}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                    <p className="text-2xl font-bold">
                        {reportData.length > 0 ? 
                            reportData[reportData.length - 1].activeStudents + reportData[reportData.length - 1].activeTutors : 0}
                    </p>
                </div>
            </div>
            
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={reportData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            dy={10}
                        />
                        <YAxis />
                        <Tooltip 
                            formatter={(value) => [`${value}`, '']}
                            labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Bar dataKey="newStudents" name="New Students" fill="#4F46E5" />
                        <Bar dataKey="newTutors" name="New Tutors" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
                <h3 className="font-medium mb-2">Data Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Students</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Tutors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tutors</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.newStudents}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.newTutors}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalStudents}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalTutors}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserGrowthReport;
