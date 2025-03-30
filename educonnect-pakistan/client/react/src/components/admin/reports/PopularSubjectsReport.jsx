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

const PopularSubjectsReport = ({ dateRange }) => {
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
                
                const response = await axios.get(`/api/admin/reports/popular-subjects?startDate=${startDate}&endDate=${endDate}`);
                
                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setError('Failed to fetch popular subjects data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching the report');
                console.error('Error fetching popular subjects report:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const topSubjects = [...reportData].slice(0, 10);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Popular Subjects Report</h2>
            
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={topSubjects}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                            dataKey="subject" 
                            type="category" 
                            tick={{fontSize: 12}}
                            width={120}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sessionCount" name="Sessions" fill="#4F46E5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
                <h3 className="font-medium mb-2">Data Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutors</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index} className={index < 3 ? "bg-blue-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sessionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.studentCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tutorCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PopularSubjectsReport;
