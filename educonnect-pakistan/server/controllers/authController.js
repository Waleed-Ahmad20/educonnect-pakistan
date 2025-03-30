const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Tutor, Admin } = require('../models/users');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create appropriate user type based on role
        let newUser;

        if (role === 'student') {
            newUser = new Student({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role,
                educationLevel: 'other'
            });
        } else if (role === 'tutor') {
            newUser = new Tutor({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role,
                bio: '',
                hourlyRate: 0
            });
        } else if (role === 'admin') {
            newUser = new Admin({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Save the new user
        await newUser.save();

        // Create JWT payload
        const payload = {
            user: {
                id: newUser.id,
                role: newUser.role
            }
        };

        // Generate JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login time
        newUser.lastLogin = Date.now();
        await newUser.save();

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse,
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Generate JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login time
        user.lastLogin = Date.now();
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
    try {
        // Get user data but exclude password
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash and update the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.updatedAt = Date.now();

        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    changePassword
};