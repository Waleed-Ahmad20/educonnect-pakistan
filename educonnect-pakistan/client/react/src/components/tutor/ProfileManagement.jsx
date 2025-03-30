import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileManagement = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    hourlyRate: user?.hourlyRate || 0,
    teachingPreference: user?.teachingPreference || 'both',
    subjects: user?.subjects || [],
    qualifications: user?.qualifications || [],
    location: {
      city: user?.location?.city || '',
      address: user?.location?.address || ''
    }
  });
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: new Date().getFullYear()
  });
  const [newSubject, setNewSubject] = useState({
    name: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    
    // Check for duplicates
    const isDuplicate = formData.subjects.some(
      subject => subject.name.toLowerCase() === newSubject.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error('This subject is already in your list');
      return;
    }
    
    // Always add subject as an object with name property
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: newSubject.name.trim() }]
    }));
    
    setNewSubject({ name: '' });
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects.splice(index, 1);
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  const handleAddQualification = () => {
    if (newQualification.degree.trim() === '' || newQualification.institution.trim() === '') return;
    
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, newQualification]
    });
    
    setNewQualification({
      degree: '',
      institution: '',
      year: new Date().getFullYear()
    });
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Ensure subjects have proper format
      const formattedData = {
        ...formData,
        subjects: formData.subjects.map(subject => {
          if (typeof subject === 'string') {
            return { name: subject };
          }
          return subject;
        })
      };
      
      const response = await axios.post('/api/tutors/profile', formattedData);
      
      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Profile Management</h2>
        <p className="text-sm text-gray-600">Update your tutor profile information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Profile Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              <img 
                src={imagePreview || '/default-avatar.png'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 cursor-pointer"
              >
                Choose Image
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, 300x300 pixels or larger
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Tell students about yourself, your teaching style, and experience"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="City"
                  required
                />
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Area/Neighborhood (optional)"
                />
              </div>
            </div>
          </div>
          
          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (PKR)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Preference</label>
              <select
                name="teachingPreference"
                value={formData.teachingPreference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="online">Online Only</option>
                <option value="in-person">In-Person Only</option>
                <option value="both">Both Online & In-Person</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Qualifications */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h3>
          
          {formData.qualifications.length > 0 && (
            <div className="mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {formData.qualifications.map((qual, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{qual.degree}</p>
                        <p className="text-sm text-gray-600">{qual.institution}, {qual.year}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Degree/Certificate</label>
                <input
                  type="text"
                  value={newQualification.degree}
                  onChange={(e) => setNewQualification({...newQualification, degree: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. BSc Mathematics"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={newQualification.institution}
                  onChange={(e) => setNewQualification({...newQualification, institution: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Karachi University"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={newQualification.year}
                  onChange={(e) => setNewQualification({...newQualification, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 2020"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddQualification}
              className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Qualification
            </button>
          </div>
        </div>
        
        {/* Subjects */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subjects</h3>
          
          {formData.subjects.length > 0 && (
            <div className="mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {formData.subjects.map((subject, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{subject.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Mathematics, Physics"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddSubject}
              className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Subject
            </button>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManagement;
