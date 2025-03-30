import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ...existing code...

const PopularSubjectsReport = () => {
    // ...existing code...
    
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Remove any permission checking before API call
                const res = await axios.get(`/api/admin/reports/popular-subjects`, {
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
                console.error('Error fetching popular subjects report:', err);
                setError(err.response?.data?.message || 'Failed to load report data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchReport();
    }, [dateRange]);

    // Remove any conditional rendering based on permissions
    
    // ...existing code...
    
    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Popular Subjects Report</h1>
                <p className="text-gray-600">See which subjects are most popular on the platform.</p>
            </header>
            
            {/* No permission check UI, just show the report */}
            
            {/* ...existing code... */}
        </div>
    );
};

export default PopularSubjectsReport;
