import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './BookingForm.css';

const BookingForm = ({ tutor, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        sessionType: 'online',
        subject: '',
        notes: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [validation, setValidation] = useState({});
    
    // Find the next available date for the tutor
    useEffect(() => {
        if (tutor && tutor.availability && tutor.availability.length > 0) {
            // Sort days in chronological order starting from today
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = new Date();
            const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Reorder days starting from today
            const reorderedDays = [
                ...days.slice(todayIndex),
                ...days.slice(0, todayIndex)
            ];
            
            // Find first day tutor is available
            const availableTutorDays = tutor.availability
                .filter(avail => avail && avail.day && typeof avail.day === 'string')
                .map(avail => avail.day.toLowerCase());
            const nextAvailableDay = reorderedDays.find(day => availableTutorDays.includes(day));
            
            if (nextAvailableDay) {
                setSelectedDay(nextAvailableDay);
                updateAvailableSlots(nextAvailableDay);
                
                // Calculate the next date for this day of week
                const dayIndex = days.indexOf(nextAvailableDay);
                const daysUntilNext = (dayIndex + 7 - today.getDay()) % 7;
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
                
                // Format date as YYYY-MM-DD for input
                const formattedDate = nextDate.toISOString().split('T')[0];
                setFormData({
                    ...formData,
                    date: formattedDate
                });
            }
        }
    }, [tutor]);
    
    // Update available time slots when selected day changes
    const updateAvailableSlots = (day) => {
        if (!tutor || !tutor.availability) return;
        
        const daySchedule = tutor.availability.find(
            avail => avail.day && typeof avail.day === 'string' && 
                    avail.day.toLowerCase() === (day && typeof day === 'string' ? day.toLowerCase() : '')
        );
        
        if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
            // Convert slots to consistent format
            const formattedSlots = daySchedule.slots.map(slot => {
                if (typeof slot === 'string') {
                    const [startTime, endTime] = slot.split(' - ');
                    return { startTime, endTime };
                }
                return slot;
            });
            
            setAvailableSlots(formattedSlots);
            
            // Set default start time to first available slot
            if (formattedSlots.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    startTime: formattedSlots[0].startTime,
                    endTime: formattedSlots[0].endTime
                }));
            }
        } else {
            setAvailableSlots([]);
        }
    };
    
    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear validation error for this field
        if (validation[name]) {
            setValidation({
                ...validation,
                [name]: ''
            });
        }
        
        // Special handling for day selection
        if (name === 'day') {
            setSelectedDay(value);
            updateAvailableSlots(value);
        }
    };
    
    // Validate the form
    const validateForm = () => {
        const errors = {};
        
        if (!formData.date) {
            errors.date = 'Date is required';
        }
        
        if (!formData.startTime) {
            errors.startTime = 'Start time is required';
        }
        
        if (!formData.endTime) {
            errors.endTime = 'End time is required';
        }
        
        if (!formData.subject) {
            errors.subject = 'Subject is required';
        }
        
        setValidation(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const sessionData = {
                tutor: tutor._id,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                sessionType: formData.sessionType,
                subject: formData.subject,
                notes: formData.notes
            };
            
            const res = await axios.post('/api/sessions', sessionData);
            
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess && onSuccess(res.data.data);
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book session. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if (success) {
        return (
            <div className="success-content">
                <div className="success-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="success-title">Session Booked Successfully!</h3>
                <p className="success-message">
                    Your session with {tutor.firstName} {tutor.lastName} has been scheduled.
                </p>
                <p className="redirect-message">
                    Redirecting to your sessions...
                </p>
            </div>
        );
    }
    
    return (
        <form className="booking-form" onSubmit={handleSubmit}>
            {error && (
                <div className="alert error-alert">
                    {error}
                </div>
            )}
            
            <div className="form-grid">
                {/* Available Days */}
                <div className="form-field">
                    <label className="form-label" htmlFor="day">Day</label>
                    <select 
                        id="day"
                        name="day"
                        value={selectedDay}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {tutor && tutor.availability && tutor.availability
                            .filter(dayObj => dayObj && dayObj.day && typeof dayObj.day === 'string')
                            .map((dayObj, idx) => (
                                <option key={idx} value={dayObj.day.toLowerCase()}>
                                    {dayObj.day.charAt(0).toUpperCase() + dayObj.day.slice(1)}
                                </option>
                            ))}
                    </select>
                </div>
                
                {/* Date */}
                <div className="form-field">
                    <label className="form-label" htmlFor="date">Date</label>
                    <input 
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`form-input ${validation.date ? 'error' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {validation.date && <div className="form-error">{validation.date}</div>}
                </div>
                
                {/* Time Slot */}
                <div className="form-field">
                    <label className="form-label" htmlFor="timeSlot">Time Slot</label>
                    {availableSlots.length > 0 ? (
                        <select 
                            id="timeSlot"
                            name="timeSlot"
                            value={`${formData.startTime}-${formData.endTime}`}
                            onChange={(e) => {
                                const [startTime, endTime] = e.target.value.split('-');
                                setFormData({
                                    ...formData,
                                    startTime,
                                    endTime
                                });
                            }}
                            className={`form-select ${validation.startTime ? 'error' : ''}`}
                        >
                            {availableSlots.map((slot, idx) => (
                                <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                    {slot.startTime} - {slot.endTime}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="form-error">No available slots for this day</div>
                    )}
                    {validation.startTime && <div className="form-error">{validation.startTime}</div>}
                </div>
                
                {/* Session Type */}
                <div className="form-field">
                    <label className="form-label" htmlFor="sessionType">Session Type</label>
                    <select 
                        id="sessionType"
                        name="sessionType"
                        value={formData.sessionType}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="online">Online</option>
                        {tutor.teachingPreference !== 'online' && (
                            <option value="in-person">In-Person</option>
                        )}
                    </select>
                </div>
                
                {/* Subject */}
                <div className="form-field">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <select 
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`form-select ${validation.subject ? 'error' : ''}`}
                    >
                        <option value="">Select a subject</option>
                        {tutor.subjects && tutor.subjects.map((subject, idx) => (
                            <option key={idx} value={subject.name}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {validation.subject && <div className="form-error">{validation.subject}</div>}
                </div>
            </div>
            
            {/* Notes */}
            <div className="form-field">
                <label className="form-label" htmlFor="notes">Notes (Optional)</label>
                <textarea 
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any specific details or topics you'd like to cover in this session"
                    className="form-textarea"
                />
            </div>
            
            {/* Submit Buttons */}
            <div className="form-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    className="form-button secondary-button"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="form-button"
                >
                    {loading && <span className="loading-spinner"></span>}
                    Book Session
                </button>
            </div>
        </form>
    );
};

export default BookingForm;