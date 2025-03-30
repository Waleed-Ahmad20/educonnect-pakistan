import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SessionCard.css';

const SessionCard = ({ session, onCancel }) => {
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    
    // Format session date and time
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };
    
    // Check if session is upcoming
    const isUpcoming = () => {
        const sessionDateTime = new Date(`${session.date}T${session.endTime}`);
        return sessionDateTime > new Date() && session.status !== 'cancelled';
    };
    
    // Check if session can be reviewed (completed and not already reviewed)
    const canReview = () => {
        return session.status === 'completed' && !session.review;
    };
    
    // Get status badge class
    const getStatusBadgeClass = () => {
        switch (session.status) {
            case 'pending':
                return 'status-badge status-pending';
            case 'confirmed':
                return 'status-badge status-confirmed';
            case 'completed':
                return 'status-badge status-completed';
            case 'cancelled':
                return 'status-badge status-cancelled';
            default:
                return 'status-badge';
        }
    };
    
    // Handle cancel button click
    const handleCancelClick = () => {
        setShowConfirmCancel(true);
    };
    
    // Handle cancel confirmation
    const handleConfirmCancel = () => {
        onCancel();
        setShowConfirmCancel(false);
    };
    
    // Cancel confirmation dialog
    const renderCancelConfirmation = () => {
        if (!showConfirmCancel) return null;
        
        return (
            <div className="cancel-overlay">
                <div className="cancel-dialog">
                    <p className="cancel-message">Are you sure you want to cancel this session?</p>
                    <div className="cancel-actions">
                        <button
                            onClick={() => setShowConfirmCancel(false)}
                            className="cancel-button cancel-no"
                        >
                            No, Keep It
                        </button>
                        <button
                            onClick={handleConfirmCancel}
                            className="cancel-button cancel-yes"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="session-card">
            {/* Cancel Confirmation Overlay */}
            {renderCancelConfirmation()}
            
            <div className="session-content">
                <div className="session-header">
                    <div className="session-title-container">
                        <h3 className="session-title">
                            Session with {session.tutor?.firstName} {session.tutor?.lastName}
                        </h3>
                        <p className="session-date">
                            {formatDate(session.date)}, {session.startTime} - {session.endTime}
                        </p>
                    </div>
                    
                    <div className="session-status-container">
                        <span className={getStatusBadgeClass()}>
                            {session.status}
                        </span>
                    </div>
                </div>
                
                <div className="session-details">
                    <div className="session-details-grid">
                        <div className="session-detail">
                            <span className="detail-label">Subject: </span>
                            {session.subject}
                        </div>
                        <div className="session-detail">
                            <span className="detail-label">Type: </span>
                            <span className="capitalize">{session.sessionType}</span>
                        </div>
                    </div>
                    
                    {session.notes && (
                        <div className="session-notes">
                            <span className="detail-label">Notes: </span>
                            {session.notes}
                        </div>
                    )}
                </div>
                
                <div className="session-actions">
                    {/* Buttons based on session status */}
                    {isUpcoming() && session.status !== 'pending' && (
                        <button
                            onClick={handleCancelClick}
                            className="action-button cancel-action"
                        >
                            Cancel
                        </button>
                    )}
                    
                    {canReview() && (
                        <Link
                            to={`/student/reviews/add/${session._id}`}
                            className="action-button review-action"
                        >
                            Leave Review
                        </Link>
                    )}
                    
                    {/* View Details button for all sessions */}
                    <Link
                        to={`/student/sessions/${session._id}`}
                        className="action-button details-action"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SessionCard; 