import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist from API
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students/wishlist');
        
        if (response.data.success) {
          // Add debug logging to inspect the structure
          console.log('Wishlist Response:', JSON.stringify(response.data, null, 2));
          
          // Check if data contains a nested tutors array or if it's directly in data
          if (response.data.data && typeof response.data.data === 'object' && response.data.data.tutors) {
            setWishlist(response.data.data.tutors || []);
          } else if (Array.isArray(response.data.data)) {
            // Transform raw data into expected format if necessary
            const formattedData = response.data.data.map(item => {
              // If item already has tutor property, return as is
              if (item && item.tutor) return item;
              
              // If item itself is the tutor (not wrapped in a tutor property)
              return { 
                tutor: item,
                addedAt: item.createdAt || new Date().toISOString()
              };
            });
            setWishlist(formattedData);
          } else {
            setWishlist([]);
          }
        } else {
          setError(response.data.message || 'Failed to load wishlist');
          setWishlist([]);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError(err.response?.data?.message || 'Failed to load wishlist');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = async (tutorId) => {
    try {
      const response = await axios.delete(`/api/students/wishlist/${tutorId}`);
      
      if (response.data.success) {
        // Update local state to handle both potential data structures
        setWishlist(wishlist.filter(item => {
          // Check if item has a tutor property
          if (item.tutor && item.tutor._id) {
            return item.tutor._id !== tutorId;
          }
          // Or if item itself is the tutor object
          return item._id !== tutorId;
        }));
      } else {
        console.error('Failed to remove tutor from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full p-6 bg-gray-50 rounded-lg">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800 mb-2">My Wishlist</h1>
        <p className="text-gray-600">Tutors you're interested in working with.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            // Safeguard against malformed data
            const tutorData = item && item.tutor ? item.tutor : item;
            const tutorId = tutorData?._id || 'unknown';
            
            return (
            <div key={tutorId} className="bg-white rounded-lg shadow-md overflow-hidden relative">
              <button
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => removeFromWishlist(tutorId)}
                aria-label="Remove from wishlist"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
              <div className="p-5">
                <div className="flex items-center space-x-4">
                  <img 
                    src={tutorData?.profilePicture || '/default-avatar.png'} 
                    alt={`${tutorData?.firstName || 'Tutor'} ${tutorData?.lastName || ''}`} 
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{tutorData?.firstName || 'Tutor'} {tutorData?.lastName || ''}</h3>
                    <p className="text-sm text-primary-600">
                      {tutorData?.subjects?.[0]?.name || 
                        (tutorData?.subjects?.length > 0 ? 
                          (typeof tutorData.subjects[0] === 'string' ? 
                            tutorData.subjects[0] : 
                            tutorData.subjects[0]?.name) : 
                          'Tutor')}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(tutorData?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">{tutorData?.averageRating?.toFixed(1) || 'No ratings'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{tutorData?.bio ? tutorData.bio.substring(0, 100) + (tutorData.bio.length > 100 ? '...' : '') : 'No bio available'}</p>
                  <p className="text-sm text-gray-500 mt-1">Added on {formatDate(item.addedAt || tutorData?.createdAt || new Date().toISOString())}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-primary-700 font-semibold">Rs. {tutorData?.hourlyRate || 0}/hr</span>
                    <Link 
                      to={`/student/tutor/${tutorId}`} 
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't added any tutors to your wishlist yet.</p>
          <Link
            to="/student/find-tutors"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            Find Tutors
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist; 