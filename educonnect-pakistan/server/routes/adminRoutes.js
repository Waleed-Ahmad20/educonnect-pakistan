const express = require('express');
const router = express.Router();
const { auth, adminAuth, hasPermission } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const adminRouteMiddleware = [auth, adminAuth];

// Verification Request Routes
router.get('/verification-requests',
    [...adminRouteMiddleware, hasPermission('verify_tutors')],
    adminController.getVerificationRequests
);

router.get('/verification-requests/:id',
    [...adminRouteMiddleware, hasPermission('verify_tutors')],
    adminController.getVerificationRequestById
);

router.put('/verification-requests/:id',
    [...adminRouteMiddleware, hasPermission('verify_tutors')],
    adminController.updateVerificationRequest
);

// Report Routes
router.get('/reports/user-growth',
    adminRouteMiddleware,
    adminController.getUserGrowthReport
);

router.get('/reports/session-completion',
    adminRouteMiddleware,
    adminController.getSessionCompletionReport
);

router.get('/reports/popular-subjects',
    adminRouteMiddleware,
    adminController.getPopularSubjectsReport
);

router.get('/reports/city-usage',
    adminRouteMiddleware,
    adminController.getCityUsageReport
);

router.get('/reports/export/:reportType',
    adminRouteMiddleware,
    adminController.exportReport
);

// Admin Dashboard Stats
router.get('/stats',
    adminRouteMiddleware,
    adminController.getAdminStats
);

// Temporary route to add permissions - REMOVE AFTER USE FOR SECURITY
router.get('/add-permission',
    adminRouteMiddleware,
    async (req, res) => {
        try {
            // Find the admin by ID (the logged in user)
            const admin = await User.findById(req.user.id);
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin user not found'
                });
            }
            
            // Initialize permissions if needed
            if (!admin.permissions) {
                admin.permissions = [];
            }
            
            // Add view_reports permission
            if (!admin.permissions.includes('view_reports')) {
                admin.permissions.push('view_reports');
            }
            
            // Add super_admin for full access
            if (!admin.permissions.includes('super_admin')) {
                admin.permissions.push('super_admin');
            }
            
            await admin.save();
            
            return res.json({
                success: true,
                message: 'Permissions added successfully',
                permissions: admin.permissions
            });
        } catch (err) {
            console.error('Error adding permissions:', err);
            return res.status(500).json({
                success: false,
                message: 'Server error while adding permissions'
            });
        }
    }
);

module.exports = router;