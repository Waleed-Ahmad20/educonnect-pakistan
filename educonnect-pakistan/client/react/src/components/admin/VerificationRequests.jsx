// ...existing code...

useEffect(() => {
    fetchVerificationRequests();
}, [status, page]);

const fetchVerificationRequests = async () => {
    try {
        setLoading(true);
        const res = await axios.get(`/api/admin/verification-requests?status=${status}&page=${page}&limit=${limit}`);
        
        if (res.data.success) {
            setRequests(res.data.data.requests || []);
            setTotalRequests(res.data.data.total || 0);
        } else {
            setError(res.data.message || 'Failed to fetch verification requests');
        }
    } catch (err) {
        console.error('Error fetching verification requests:', err);
        if (err.response?.status === 403) {
            setError('You do not have permission to access this resource. Contact your administrator to grant the "verify_tutors" permission.');
        } else {
            setError(err.response?.data?.message || 'Failed to fetch verification requests');
        }
    } finally {
        setLoading(false);
    }
};

// ...existing code...

return (
    <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tutor Verification Requests</h1>
        
        {/* Status filter */}
        {/* ...existing code... */}
        
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                <p className="font-medium">Error</p>
                <p>{error}</p>
                {error.includes('permission') && (
                    <p className="mt-2 text-sm">
                        To fix this issue, an administrator needs to grant you the "verify_tutors" permission.
                    </p>
                )}
            </div>
        )}
        
        {/* ...rest of the component... */}
    </div>
);
