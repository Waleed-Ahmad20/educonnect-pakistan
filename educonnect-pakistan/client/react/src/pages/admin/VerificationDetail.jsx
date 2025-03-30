import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerificationDetail = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    
    const [request, setRequest] = useState(null);
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [comment, setComment] = useState('');
    
    useEffect(() => {
        const fetchVerificationRequest = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/admin/verification-requests/${requestId}`);
                
                if (res.data.success) {
                    setRequest(res.data.data);
                    setTutor(res.data.data.tutor);
                } else {
                    setError(res.data.message || 'Failed to load verification details');
                }
            } catch (err) {
                console.error('Error fetching verification details:', err);
                setError(err.response?.data?.message || 'Failed to load verification details');
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationRequest();
    }, [requestId]);

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            const res = await axios.put(`/api/admin/verification-requests/${requestId}`, {
                status: 'approved',
                adminComments: comment
            });
            
            if (res.data.success) {
                toast.success('Tutor verification approved successfully');
                navigate('/admin/verification');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve verification');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!comment) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setActionLoading(true);
            const res = await axios.put(`/api/admin/verification-requests/${requestId}`, {
                status: 'rejected',
                rejectionReason: comment
            });
            
            if (res.data.success) {
                toast.success('Tutor verification rejected');
                navigate('/admin/verification');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject verification');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestMoreInfo = async () => {
        if (!comment) {
            toast.error('Please specify what additional information is needed');
            return;
        }

        try {
            setActionLoading(true);
            const res = await axios.put(`/api/admin/verification-requests/${requestId}`, {
                status: 'additional_info_requested',
                additionalInfoRequested: comment
            });
            
            if (res.data.success) {
                toast.success('Additional information requested from tutor');
                navigate('/admin/verification');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request additional information');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="w-full p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="w-full p-6 bg-gray-50 rounded-lg">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    {error || 'Verification request not found'}
                </div>
                <button
                    onClick={() => navigate('/admin/verification')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    Back to Verification Requests
                </button>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary-800">Verification Request Details</h1>
                    <button
                        onClick={() => navigate('/admin/verification')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Back to List
                    </button>
                </div>
                <div className="mt-2 flex items-center">
                    <span 
                        className={`px-3 py-1 text-sm rounded-full font-medium 
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          request.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'}`}
                    >
                        {request.status.replace(/_/g, ' ')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                        Submitted on {formatDate(request.createdAt)}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tutor Information */}
                <div className="col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tutor Information</h2>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                            <div className="flex-shrink-0 h-24 w-24 mb-4 sm:mb-0">
                                <img 
                                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" 
                                    src={tutor.profilePicture || "/default-avatar.png"} 
                                    alt={`${tutor.firstName} ${tutor.lastName}`}
                                    onError={(e) => { e.target.src = "/default-avatar.png" }}
                                />
                            </div>
                            <div className="sm:ml-6">
                                <h3 className="text-lg font-semibold text-gray-800">{tutor.firstName} {tutor.lastName}</h3>
                                <p className="text-gray-600">{tutor.email}</p>
                                <p className="text-gray-600">Hourly Rate: ₨ {tutor.hourlyRate}</p>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">Bio</h4>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                                {tutor.bio || 'No bio provided'}
                            </p>
                        </div>
                        
                        {/* Qualifications */}
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">Qualifications</h4>
                            {tutor.qualifications && tutor.qualifications.length > 0 ? (
                                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                    {tutor.qualifications.map((qual, index) => (
                                        <div key={index} className="mb-2 last:mb-0">
                                            <div className="font-medium">{qual.degree}</div>
                                            <div className="text-sm text-gray-600">{qual.institution}, {qual.year}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No qualifications provided</p>
                            )}
                        </div>
                        
                        {/* Subjects */}
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">Subjects</h4>
                            {tutor.subjects && tutor.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {tutor.subjects.map((subject, index) => (
                                        <span 
                                            key={index} 
                                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                                        >
                                            {typeof subject === 'string' ? subject : subject.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No subjects provided</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Verification Documents */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Documents</h2>
                        
                        {request.documents && request.documents.length > 0 ? (
                            <div className="space-y-4">
                                {request.documents.map((doc, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{doc.title}</h4>
                                                <p className="text-sm text-gray-500">Type: {doc.type}</p>
                                                <p className="text-sm text-gray-500">Uploaded: {formatDate(doc.uploadedAt)}</p>
                                            </div>
                                            <a
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No documents uploaded</p>
                        )}
                    </div>
                </div>
                
                {/* Action Panel */}
                <div className="col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Review Action</h2>
                        
                        {/* Previous comments if any */}
                        {request.adminComments && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                                <h4 className="font-medium text-gray-800 mb-1">Previous Admin Comments:</h4>
                                <p className="text-sm text-gray-600">{request.adminComments}</p>
                            </div>
                        )}
                        
                        {/* Comment field */}
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                Comments / Reason
                            </label>
                            <textarea
                                id="comment"
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add your comments or reason for approval/rejection..."
                            ></textarea>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading || request.status === 'approved'}
                                className={`w-full py-2 px-4 rounded-md flex justify-center items-center
                                    ${(actionLoading || request.status === 'approved')
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {actionLoading ? (
                                    <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                                ) : null}
                                {request.status === 'approved' ? 'Already Approved' : 'Approve Verification'}
                            </button>
                            
                            <button
                                onClick={handleRequestMoreInfo}
                                disabled={actionLoading || request.status === 'approved' || request.status === 'rejected'}
                                className={`w-full py-2 px-4 rounded-md
                                    ${(actionLoading || request.status === 'approved' || request.status === 'rejected')
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Request Additional Information
                            </button>
                            
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || request.status === 'approved' || request.status === 'rejected'}
                                className={`w-full py-2 px-4 rounded-md
                                    ${(actionLoading || request.status === 'approved' || request.status === 'rejected')
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                Reject Verification
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationDetail;
