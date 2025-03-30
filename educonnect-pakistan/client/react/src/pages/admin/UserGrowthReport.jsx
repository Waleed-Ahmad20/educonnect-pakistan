import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserGrowthReport = () => {
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await axios.get(`/api/admin/reports/user-growth`, {
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
                console.error('Error fetching user growth report:', err);
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
                <h1 className="text-2xl font-bold text-primary-800 mb-2">User Growth Report</h1>
                <p className="text-gray-600">Track user registration trends over time.</p>
            </header>
            
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {reportData && (
                <div>
                    {/* Render report data */}
                    <pre>{JSON.stringify(reportData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default UserGrowthReport;
