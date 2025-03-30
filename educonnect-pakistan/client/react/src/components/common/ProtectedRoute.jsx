import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({
    requiredRole = null,
    redirectPath = '/auth/login',
    children
}) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show loading state
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If there are children, render them, otherwise render the outlet
    return children ? children : <Outlet />;
};

export default ProtectedRoute;