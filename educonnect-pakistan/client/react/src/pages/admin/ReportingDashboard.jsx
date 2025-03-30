import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChartContainer } from '../../components/admin/ChartComponents';
import { ExportReportButton } from '../../components/admin/ExportTools';

const ReportingDashboard = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [reportType, setReportType] = useState('userGrowth');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportTypes = [
        { value: 'userGrowth', label: 'User Growth Over Time' },
        { value: 'sessions', label: 'Session Completion Rates' },
        { value: 'subjects', label: 'Popular Subjects' },
        { value: 'cities', label: 'Platform Usage by City' }
    ];

    useEffect(() => {
        fetchReportData();
    }, [startDate, endDate, reportType]);

    const fetchReportData = async () => {
        if (!startDate || !endDate) return;

        try {
            setLoading(true);
            setError(null);
            
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];
            
            const res = await axios.get(`/api/admin/reports/${reportType}`, {
                params: { startDate: formattedStartDate, endDate: formattedEndDate }
            });
            
            if (res.data.success) {
                setReportData(res.data.data);
            } else {
                setError('Failed to load report data');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Analytics & Reporting</h1>
                <p className="text-gray-600">View and analyze platform metrics and generate reports</p>
            </header>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {reportTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            maxDate={new Date()}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            maxDate={new Date()}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <ExportReportButton 
                            data={reportData} 
                            reportType={reportType} 
                            startDate={startDate} 
                            endDate={endDate} 
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Chart Display */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                    {reportTypes.find(t => t.value === reportType)?.label || 'Report'}
                </h2>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                    </div>
                ) : reportData ? (
                    <ChartContainer 
                        reportType={reportType} 
                        data={reportData} 
                        startDate={startDate} 
                        endDate={endDate} 
                    />
                ) : (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                        No data available for the selected period
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportingDashboard;
