import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SessionCompletionReport = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`/api/admin/reports/session-completion`, {
                    params: {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    }
                });

                if (res.data.success) {
                    setReportData(res.data.data);
                } else {
                    setError(res.data.message || 'Failed to load report');
                }
            } catch (err) {
                console.error('Error fetching session completion report:', err);
                setError(err.response?.data?.message || 'Failed to load report data');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [dateRange]);

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Session Completion Report</h1>
                <p className="text-gray-600">Track session completion rates and statistics.</p>
            </header>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div>
                    {/* Render report data */}
                    {reportData.length > 0 ? (
                        <ul>
                            {reportData.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No data available for the selected date range.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SessionCompletionReport;
