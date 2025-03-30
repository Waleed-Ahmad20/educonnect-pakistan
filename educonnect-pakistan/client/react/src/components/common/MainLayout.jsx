import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    // Helper function to get appropriate dashboard route based on role
    const getDashboardRoute = () => {
        if (hasRole('student')) return '/student/dashboard';
        if (hasRole('tutor')) return '/tutor/dashboard';
        if (hasRole('admin')) return '/admin/dashboard';
        return '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link to={getDashboardRoute()} className="text-white font-bold text-xl">
                                    EduConnect Pakistan
                                </Link>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link
                                        to={getDashboardRoute()}
                                        className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Dashboard
                                    </Link>

                                    {/* Add specific feature links based on role */}
                                    {hasRole('student') && (
                                        <>
                                            {/* Student links removed for brevity */}
                                        </>
                                    )}

                                    {hasRole('tutor') && (
                                        <>
                                            {/* Tutor links removed for brevity */}
                                        </>
                                    )}

                                    {/* Removed admin verification link from here */}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <span className="text-white mr-4">
                                    Hello, {user?.firstName}
                                </span>

                                <Link
                                    to="/profile"
                                    className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;