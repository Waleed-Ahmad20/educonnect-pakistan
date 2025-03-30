const jwt = require('jsonwebtoken');
const { User } = require('../models/users');

const auth = async (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user = await User.findById(req.user.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User no longer active or valid'
            });
        }

        req.user.role = user.role;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};



const studentAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Student role required'
        });
    }
    next();
};

const tutorAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'tutor') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Tutor role required'
        });
    }
    next();
};

const adminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Admin role required'
        });
    }
    next();
};

const hasPermission = (permission) => {
    return async (req, res, next) => {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin role required'
            });
        }

        try {
            const admin = await User.findById(req.user.id).select('permissions');

            if (!admin || !admin.permissions ||
                (!admin.permissions.includes(permission) &&
                    !admin.permissions.includes('super_admin'))) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: '${permission}' permission required`
                });
            }

            next();
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Server error while checking permissions'
            });
        }
    };
};

module.exports = {
    auth,
    studentAuth,
    tutorAuth,
    adminAuth,
    hasPermission
};
