import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="w-full p-6 bg-gray-50 rounded-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Student Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName || 'Student'}! Manage your learning journey.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Tutor Search Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">Find Tutors</h3>
                        <p className="text-sm text-gray-600">Search for qualified tutors based on your needs</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            Find the perfect tutor by searching through our qualified professionals.
                            Filter by subject, location, price range, and more.
                        </p>
                        <Link to="/student/find-tutors" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            Search Tutors
                        </Link>
                    </div>
                </div>

                {/* Session Management Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">My Sessions</h3>
                        <p className="text-sm text-gray-600">Manage your booked tutoring sessions</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            View your upcoming and past sessions. Reschedule, cancel, or book new sessions with your tutors.
                        </p>
                        <Link to="/student/sessions" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            View Sessions
                        </Link>
                    </div>
                </div>

                {/* Reviews Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">My Reviews</h3>
                        <p className="text-sm text-gray-600">Rate and review your tutors</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            Leave feedback for your tutors after completed sessions. Your reviews help other students find great tutors.
                        </p>
                        <Link to="/student/reviews" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            Manage Reviews
                        </Link>
                    </div>
                </div>

                {/* Wishlist Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="p-5 bg-primary-50 border-b border-primary-100">
                        <h3 className="text-lg font-semibold text-primary-800 mb-1">My Wishlist</h3>
                        <p className="text-sm text-gray-600">Manage your favorite tutors</p>
                    </div>
                    <div className="p-5 flex flex-col h-40">
                        <p className="text-sm text-gray-500 mb-4 flex-grow">
                            Keep track of tutors you're interested in. Save tutors to your wishlist for future reference.
                        </p>
                        <Link to="/student/wishlist" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 self-start">
                            View Wishlist
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard; 