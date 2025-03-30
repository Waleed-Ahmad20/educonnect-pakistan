import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

const SessionCompletionReport = ({ dateRange }) => {
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
                
                const response = await axios.get(`/api/admin/reports/session-completion?startDate=${startDate}&endDate=${endDate}`);
                
                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setError('Failed to fetch session completion data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching the report');
                console.error('Error fetching session completion report:', err);
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

    // Calculate totals for summary stats
    const totalSessions = reportData.reduce((acc, item) => acc + item.totalSessions, 0);
    const completedSessions = reportData.reduce((acc, item) => acc + item.completedSessions, 0);
    const cancelledSessions = reportData.reduce((acc, item) => acc + item.cancelledSessions, 0);
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Session Completion Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                    <p className="text-2xl font-bold">{totalSessions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                    <p className="text-2xl font-bold">{completedSessions}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
                    <p className="text-2xl font-bold">{cancelledSessions}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                    <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
            </div>
            
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
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
                            labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="completedSessions" name="Completed" stroke="#10B981" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cancelledSessions" name="Cancelled" stroke="#EF4444" />
                        <Line type="monotone" dataKey="onlineSessions" name="Online" stroke="#4F46E5" />
                        <Line type="monotone" dataKey="inPersonSessions" name="In-Person" stroke="#F59E0B" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6">
                <h3 className="font-medium mb-2">Data Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In-Person</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalSessions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.completedSessions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cancelledSessions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.onlineSessions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.inPersonSessions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SessionCompletionReport;
