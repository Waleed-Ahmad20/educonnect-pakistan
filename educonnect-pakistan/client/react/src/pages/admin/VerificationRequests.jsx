import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const VerificationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });

    useEffect(() => {
        const fetchVerificationRequests = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/admin/verification-requests?status=${filter}&page=${pagination.page}&limit=${pagination.limit}`);
                
                if (res.data.success) {
                    setRequests(res.data.data.requests);
                    setPagination({
                        ...pagination,
                        total: res.data.data.total
                    });
                } else {
                    setError(res.data.message || 'Failed to load verification requests');
                }
            } catch (err) {
                console.error('Error fetching verification requests:', err);
                setError(err.response?.data?.message || 'Failed to load verification requests');
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationRequests();
    }, [filter, pagination.page, pagination.limit]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPagination({ ...pagination, page: 1 });
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
            setPagination({ ...pagination, page: newPage });
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'additional_info_requested':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Tutor Verification Requests</h1>
                <p className="text-gray-600">Review and manage tutor verification requests.</p>
            </header>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'pending' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleFilterChange('pending')}
                >
                    Pending
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'under_review' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleFilterChange('under_review')}
                >
                    Under Review
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'approved' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleFilterChange('approved')}
                >
                    Approved
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'rejected' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleFilterChange('rejected')}
                >
                    Rejected
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'additional_info_requested' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleFilterChange('additional_info_requested')}
                >
                    Additional Info Requested
                </button>
            </div>

            {/* Requests Table */}
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center text-gray-600 shadow-sm border border-gray-200">
                    No {filter} verification requests found.
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img 
                                                    className="h-10 w-10 rounded-full object-cover" 
                                                    src={request.tutor.profilePicture || "/default-avatar.png"} 
                                                    alt=""
                                                    onError={(e) => { e.target.src = "/default-avatar.png" }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.tutor.firstName} {request.tutor.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{request.tutor.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                                            {request.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(request.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link 
                                            to={`/admin/verification/${request._id}`}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && requests.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> of <span className="font-medium">{pagination.total}</span> results
                    </div>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className={`px-3 py-1 rounded-md ${pagination.page === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            className={`px-3 py-1 rounded-md ${pagination.page * pagination.limit >= pagination.total 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationRequests;
