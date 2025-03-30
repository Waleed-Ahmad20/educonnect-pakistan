/**
 * Helper functions for authentication-related tasks
 */

// Checks if the token is valid by format (not expired)
export const isValidToken = (token) => {
    if (!token) return false;

    try {
        // Parse the token (JWT structure: header.payload.signature)
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));

        // Check if token is expired
        return decoded.exp * 1000 > Date.now();
    } catch (err) {
        return false;
    }
};

// Format user data from API response
export const formatUserData = (userData) => {
    if (!userData) return null;

    return {
        id: userData._id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLogin: userData.lastLogin,
        fullName: `${userData.firstName} ${userData.lastName}`
    };
};

// Get role-specific redirect path after login
export const getRedirectPathForRole = (role) => {
    switch (role) {
        case 'student':
            return '/student/dashboard';
        case 'tutor':
            return '/tutor/dashboard';
        case 'admin':
            return '/admin/dashboard';
        default:
            return '/dashboard';
    }
};