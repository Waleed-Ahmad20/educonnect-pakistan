import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AvailabilityScheduler = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Define daysOfWeek before using it
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Now we can use daysOfWeek safely in the state initialization
  const [availability, setAvailability] = useState(
    user?.availability || 
    daysOfWeek.map(day => ({ day: day.value, slots: [] }))
  );

  const [newSlots, setNewSlots] = useState(
    Array.from({ length: 7 }, () => ({ startTime: '', endTime: '' }))
  );

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Starting from 8 AM
    const minute = i % 2 === 0 ? '00' : '30';
    const time = `${hour}:${minute}`;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayTime = `${displayHour}:${minute} ${ampm}`;
    return { value: time, label: displayTime };
  });

  // Improved useEffect with proper dependency
  useEffect(() => {
    // Log current user availability for debugging
    console.log("Current user availability:", user?.availability);
    
    // Initialize availability if empty or missing
    if (!availability || availability.length === 0) {
      const initialAvailability = daysOfWeek.map(day => ({ 
        day: day.value, 
        slots: [] 
      }));
      console.log("Setting initial availability:", initialAvailability);
      setAvailability(initialAvailability);
    }
  }, [user?.availability, availability]); // Use specific property instead of whole user object

  const handleNewSlotChange = (dayIndex, field, value) => {
    setNewSlots(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [field]: value };
      return updated;
    });
  };

  const handleAddSlot = (dayIndex) => {
    if (!newSlots[dayIndex] || !newSlots[dayIndex].startTime || !newSlots[dayIndex].endTime) {
      toast.error('Please select both start and end times');
      return;
    }

    const start = new Date(`2000-01-01T${newSlots[dayIndex].startTime}`);
    const end = new Date(`2000-01-01T${newSlots[dayIndex].endTime}`);

    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    const updatedAvailability = [...availability];
    const dayValue = daysOfWeek[dayIndex].value;
    
    // Find the day object or create it if it doesn't exist
    let dayObject = updatedAvailability.find(d => d.day === dayValue);
    
    if (!dayObject) {
      dayObject = { day: dayValue, slots: [] };
      updatedAvailability.push(dayObject);
    }
    
    // Make sure slots array exists
    if (!dayObject.slots) {
      dayObject.slots = [];
    }
    
    // Add the new slot
    dayObject.slots.push({
      startTime: newSlots[dayIndex].startTime,
      endTime: newSlots[dayIndex].endTime
    });
    
    console.log("Updated availability after adding slot:", updatedAvailability);
    setAvailability(updatedAvailability);
    
    // Reset the new slot form for this day
    setNewSlots(prev => {
      const updated = [...prev];
      updated[dayIndex] = { startTime: '', endTime: '' };
      return updated;
    });
  };

  // Fixed function to not filter out days with empty slots
  const handleRemoveTimeSlot = (day, index) => {
    const updatedAvailability = availability.map(a => {
      if (a.day === day) {
        const newSlots = [...a.slots];
        newSlots.splice(index, 1);
        return { ...a, slots: newSlots };
      }
      return a;
    });
    
    console.log("Updated availability after removing slot:", updatedAvailability);
    setAvailability(updatedAvailability);
  };

  const handleTimeChange = (day, index, field, value) => {
    setAvailability(
      availability.map(a => {
        if (a.day === day) {
          const newSlots = [...a.slots];
          newSlots[index] = { ...newSlots[index], [field]: value };
          return { ...a, slots: newSlots };
        }
        return a;
      })
    );
  };

  const handleSaveAvailability = async () => {
    setLoading(true);
    try {
      // Ensure we have all days represented
      const completeAvailability = daysOfWeek.map(day => {
        const existing = availability.find(a => a.day === day.value);
        return existing || { day: day.value, slots: [] };
      });
      
      console.log("Sending availability to server:", completeAvailability);
      
      const response = await axios.put('/api/tutors/availability', { 
        availability: completeAvailability 
      });
      
      if (response.data.success) {
        console.log("Server response:", response.data);
        setUser({ ...user, availability: completeAvailability });
        toast.success('Availability updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Availability Schedule</h2>
        <p className="text-sm text-gray-600">Set your weekly availability for tutoring sessions</p>
      </div>
      
      <div className="p-6">
        {daysOfWeek.map((day, dayIndex) => {
          const dayAvailability = availability.find(a => a.day === day.value);
          const slots = dayAvailability?.slots || [];
          
          return (
            <div key={day.value} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{day.label}</h3>
              </div>
              
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500 mb-2">No availability set</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(day.value, index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {timeSlots.map(time => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                      
                      <span className="text-gray-500">to</span>
                      
                      <select
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(day.value, index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {timeSlots.map(time => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(day.value, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 mb-2">
                <select
                  value={newSlots[dayIndex].startTime}
                  onChange={(e) => handleNewSlotChange(dayIndex, 'startTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select start time</option>
                  {timeSlots.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
                
                <span className="text-gray-500">to</span>
                
                <select
                  value={newSlots[dayIndex].endTime}
                  onChange={(e) => handleNewSlotChange(dayIndex, 'endTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select end time</option>
                  {timeSlots.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => handleAddSlot(dayIndex)}
                  className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                >
                  Add Time Slot
                </button>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAvailability}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduler;
