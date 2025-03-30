import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import UserGrowthReport from '../../components/admin/reports/UserGrowthReport';
import SessionCompletionReport from '../../components/admin/reports/SessionCompletionReport';
import PopularSubjectsReport from '../../components/admin/reports/PopularSubjectsReport';
import CityUsageReport from '../../components/admin/reports/CityUsageReport';
import DateRangeSelector from '../../components/admin/reports/DateRangeSelector';
import { toast } from 'react-toastify';
import axios from 'axios';

const Reports = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date()
    });
    const [exporting, setExporting] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    const reportTypes = ['user-growth', 'session-completion', 'popular-subjects', 'city-usage'];

    const handleExport = async (format) => {
        try {
            setExporting(true);
            setGlobalError(null);
            const reportType = reportTypes[tabIndex];
            
            const response = await axios.get(
                `/api/admin/reports/export/${reportType}`, 
                {
                    params: {
                        startDate: dateRange.startDate.toISOString().split('T')[0],
                        endDate: dateRange.endDate.toISOString().split('T')[0],
                        format
                    },
                    responseType: 'blob'
                }
            );
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from header or create one
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'report.' + format;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
            } else {
                filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success(`Report successfully exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting report:', error);
            
            let errorMessage = 'Failed to export report. Please try again later.';
            
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Report export endpoint not found. Please contact the administrator.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            setGlobalError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Platform Reports</h1>
                <p className="text-gray-600">Analyze platform performance and usage metrics</p>
            </header>

            {globalError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                        </svg>
                        <span>{globalError}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 flex flex-wrap justify-between items-center border-b">
                    <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
                    
                    <div className="mt-4 sm:mt-4 md:ml-4 flex space-x-2">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            {exporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>
                
                <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                    <TabList className="flex border-b">
                        <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-primary-600 cursor-pointer text-sm font-medium" selectedClassName="border-primary-500 text-primary-600">User Growth</Tab>
                        <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-primary-600 cursor-pointer text-sm font-medium" selectedClassName="border-primary-500 text-primary-600">Session Completion</Tab>
                        <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-primary-600 cursor-pointer text-sm font-medium" selectedClassName="border-primary-500 text-primary-600">Popular Subjects</Tab>
                        <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-primary-600 cursor-pointer text-sm font-medium" selectedClassName="border-primary-500 text-primary-600">City Usage</Tab>
                    </TabList>

                    <div className="p-4">
                        <TabPanel>
                            <UserGrowthReport dateRange={dateRange} />
                        </TabPanel>
                        <TabPanel>
                            <SessionCompletionReport dateRange={dateRange} />
                        </TabPanel>
                        <TabPanel>
                            <PopularSubjectsReport dateRange={dateRange} />
                        </TabPanel>
                        <TabPanel>
                            <CityUsageReport dateRange={dateRange} />
                        </TabPanel>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Reports;
