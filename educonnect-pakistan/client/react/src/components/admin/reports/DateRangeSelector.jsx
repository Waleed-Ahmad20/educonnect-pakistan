import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangeSelector = ({ dateRange, setDateRange }) => {
    const [startDate, setStartDate] = useState(dateRange.startDate);
    const [endDate, setEndDate] = useState(dateRange.endDate);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        setDateRange({
            ...dateRange,
            startDate: date
        });
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        setDateRange({
            ...dateRange,
            endDate: date
        });
    };

    const setPresetRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        setStartDate(start);
        setEndDate(end);
        setDateRange({
            startDate: start,
            endDate: end
        });
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label className="text-sm font-medium text-gray-600">Start Date:</label>
                <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label className="text-sm font-medium text-gray-600">End Date:</label>
                <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            
            <div className="flex space-x-2">
                <button 
                    onClick={() => setPresetRange(7)} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                    7d
                </button>
                <button 
                    onClick={() => setPresetRange(30)} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                    30d
                </button>
                <button 
                    onClick={() => setPresetRange(90)} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                    90d
                </button>
            </div>
        </div>
    );
};

export default DateRangeSelector;
