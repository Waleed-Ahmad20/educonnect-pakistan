import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [availabilityDay, setAvailabilityDay] = useState('');
  const [sessionType, setSessionType] = useState('');

  // Fetch tutors from the API
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tutors');

        if (response.data.success) {
          const tutorsData = response.data.data?.tutors || response.data.data || [];
          setTutors(Array.isArray(tutorsData) ? tutorsData : []);
        } else {
          setError(response.data.message || 'Failed to load tutors');
          setTutors([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tutors');
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Normalize and extract subjects from tutor data
  const normalizeSubjects = (tutorSubjects) => {
    if (!tutorSubjects || !Array.isArray(tutorSubjects) || tutorSubjects.length === 0) {
      return [];
    }

    return tutorSubjects.map(subject => {
      if (typeof subject === 'string') {
        return subject.toLowerCase();
      } else if (typeof subject === 'object' && subject !== null) {
        return (subject.name || '').toLowerCase();
      }
      return '';
    }).filter(subject => subject);
  };

  // Extract unique subjects from all tutors
  const subjects = [...new Set(
    tutors.flatMap(tutor => normalizeSubjects(tutor.subjects))
  )].sort();

  // Extract unique locations from all tutors
  const locations = [...new Set(
    tutors.map(tutor => {
      if (!tutor.location) {
        if (tutor.teachingPreference === 'online' || tutor.teachingPreference === 'both') {
          return '';
        }
        return '';
      }

      // Handle both string and object location formats
      if (typeof tutor.location === 'string') {
        return tutor.location;
      } else if (typeof tutor.location === 'object' && tutor.location !== null) {
        return tutor.location.city || '';
      }

      return '';
    }).filter(location => location && location != 'Online')
  )].sort();

  // Extract teaching preferences for session type filtering
  const sessionTypes = [
    { value: 'online', label: 'Online' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'both', label: 'Both Online & In-Person' }
  ];

  // Filter tutors based on all criteria
  const filteredTutors = tutors.filter(tutor => {
    if (!tutor || typeof tutor !== 'object') return false;

    // Convert to plain object if needed
    const tutorObj = typeof tutor.toObject === 'function' ? tutor.toObject() : tutor;

    const fullName = `${tutorObj.firstName || ''} ${tutorObj.lastName || ''}`.toLowerCase();
    const normalizedSubjects = normalizeSubjects(tutorObj.subjects);

    // Apply all filters
    const matchesSearch =
      searchTerm === '' ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (tutorObj.bio && tutorObj.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubject =
      subjectFilter === '' ||
      normalizedSubjects.some(subject =>
        subject === subjectFilter.toLowerCase()
      );

    const hasOnlinePreference = tutorObj.teachingPreference === 'online' || tutorObj.teachingPreference === 'both';
    const hasInPersonPreference = tutorObj.teachingPreference === 'in-person' || tutorObj.teachingPreference === 'both';

    // Handle location as both string and object
    let tutorLocation = '';
    if (typeof tutorObj.location === 'string') {
      tutorLocation = tutorObj.location;
    } else if (typeof tutorObj.location === 'object' && tutorObj.location !== null) {
      tutorLocation = tutorObj.location.city || '';
    }

    const matchesLocation =
      locationFilter === '' ||
      (tutorLocation && tutorLocation.toLowerCase() === locationFilter.toLowerCase()) ||
      (locationFilter.toLowerCase() === 'online' && hasOnlinePreference);

    const matchesPrice =
      (minPrice === '' || (tutorObj.hourlyRate && tutorObj.hourlyRate >= parseInt(minPrice))) &&
      (maxPrice === '' || (tutorObj.hourlyRate && tutorObj.hourlyRate <= parseInt(maxPrice)));

    const matchesRating =
      minRating === 0 ||
      (typeof tutorObj.averageRating === 'number' && tutorObj.averageRating >= minRating);

    const matchesAvailability =
      availabilityDay === '' ||
      (tutorObj.availability && Array.isArray(tutorObj.availability) && tutorObj.availability.some(slot =>
        slot.day && slot.day.toLowerCase() === availabilityDay.toLowerCase()
      ));

    const matchesSessionType =
      sessionType === '' ||
      (sessionType === 'online' && hasOnlinePreference) ||
      (sessionType === 'in-person' && hasInPersonPreference) ||
      (sessionType === 'both' && tutorObj.teachingPreference === 'both');

    return matchesSearch && matchesSubject && matchesLocation &&
      matchesPrice && matchesRating && matchesAvailability &&
      matchesSessionType;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSubjectFilter('');
    setLocationFilter('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setAvailabilityDay('');
    setSessionType('');
  };

  // Add tutor to wishlist
  const addToWishlist = async (tutorId) => {
    try {
      const response = await axios.post(`/api/students/wishlist/${tutorId}`);

      if (response.data.success) {
        // Show a success message or update UI
        console.log('Tutor added to wishlist successfully');
      } else {
        console.error('Failed to add tutor to wishlist');
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 rounded-lg">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800 mb-2">Find Tutors</h1>
        <p className="text-gray-600">Discover experienced tutors who can help you achieve your academic goals.</p>
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

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by name */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Tutors</label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search by name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Subject filter */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              id="subject"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              id="location"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Any Location</option>
              <option value="Online">Online</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                id="minPrice"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                id="maxPrice"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Minimum rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
            <select
              id="rating"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Session type */}
          <div>
            <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
            <select
              id="sessionType"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="">Any Type</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Reset filters button */}
        <div className="mt-4 text-right">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.length > 0 ? (
            filteredTutors.map(tutor => {
              // Convert MongoDB document to plain object if needed
              const tutorObj = typeof tutor.toObject === 'function' ? tutor.toObject() : tutor;
              // Extract the ID safely
              const tutorId = tutorObj._id?.toString() || tutorObj._id || 'unknown';
              // Normalize subject display
              const tutorSubjects = normalizeSubjects(tutorObj.subjects);

              return (
                <div key={tutorId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="p-4 flex items-start space-x-4">
                    <img
                      src={tutorObj.profilePicture || '/default-avatar.png'}
                      alt={`${tutorObj.firstName || ''} ${tutorObj.lastName || ''}`}
                      className="h-20 w-20 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{tutorObj.firstName || ''} {tutorObj.lastName || ''}</h3>
                      <p className="text-sm text-primary-600 font-medium">
                        {tutorSubjects.length > 0 ? tutorSubjects[0] : 'Tutor'}
                      </p>
                      {/* Teaching mode indicator */}
                      <p className="text-xs text-gray-500 mt-1">
                        {tutorObj.teachingPreference === 'online' ? 'Online Only' :
                          tutorObj.teachingPreference === 'in-person' ? 'In-Person Only' :
                            tutorObj.teachingPreference === 'both' ? 'Online & In-Person' : ''}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(tutorObj.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">
                          {tutorObj.averageRating ? tutorObj.averageRating.toFixed(1) : 'No ratings'}
                          {tutorObj.totalReviews ? ` (${tutorObj.totalReviews})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {typeof tutorObj.location === 'string' ? tutorObj.location :
                          typeof tutorObj.location === 'object' && tutorObj.location ? tutorObj.location.city || 'Online' : 'Online'}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {tutorObj.bio ? (tutorObj.bio.length > 100 ? tutorObj.bio.substring(0, 100) + '...' : tutorObj.bio) : 'No bio available'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tutorSubjects.slice(0, 3).map((subject, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                      {tutorSubjects.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{tutorSubjects.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-700 font-semibold">Rs. {tutorObj.hourlyRate || 0}/hr</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToWishlist(tutorId)}
                          className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
                          title="Add to Wishlist"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <Link
                          to={`/student/tutor/${tutorId}`}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No tutors found matching your criteria.</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindTutors;