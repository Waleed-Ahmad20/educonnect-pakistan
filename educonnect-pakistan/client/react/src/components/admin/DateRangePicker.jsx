import { useState, useEffect } from 'react';

const DateRangePicker = ({ dateRange, onChange }) => {
    const [startDate, setStartDate] = useState(
        dateRange.startDate.toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(
        dateRange.endDate.toISOString().split('T')[0]
    );

    useEffect(() => {
        setStartDate(dateRange.startDate.toISOString().split('T')[0]);
        setEndDate(dateRange.endDate.toISOString().split('T')[0]);
    }, [dateRange]);

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        
        if (new Date(newStartDate) <= new Date(endDate)) {
            onChange({
                startDate: new Date(newStartDate),
                endDate: dateRange.endDate
            });
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        
        if (new Date(newEndDate) >= new Date(startDate)) {
            onChange({
                startDate: dateRange.startDate,
                endDate: new Date(newEndDate)
            });
        }
    };

    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        
        onChange({
            startDate: start,
            endDate: end
        });
    };

    return (
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <div className="text-sm font-medium text-gray-700">Quick select:</div>
            <div className="flex space-x-1">
                <button
                    type="button"
                    onClick={() => handleQuickSelect(7)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Last 7 days
                </button>
                <button
                    type="button"
                    onClick={() => handleQuickSelect(30)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Last 30 days
                </button>
                <button
                    type="button"
                    onClick={() => handleQuickSelect(90)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Last 90 days
                </button>
            </div>
            
            <div className="flex items-center space-x-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-gray-600">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
            </div>
        </div>
    );
};

export default DateRangePicker;
