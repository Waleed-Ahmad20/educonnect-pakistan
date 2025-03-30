const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const { User } = require('../models/users');

async function addPermissionToAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find your admin user by email
        const adminEmail = 'your-admin-email@example.com'; // Replace with your actual admin email
        
        const admin = await User.findOne({ email: adminEmail, role: 'admin' });
        
        if (!admin) {
            console.error('Admin user not found');
            return;
        }
        
        // Initialize permissions array if it doesn't exist
        if (!admin.permissions) {
            admin.permissions = [];
        }
        
        // Add permission if it doesn't already exist
        if (!admin.permissions.includes('view_reports')) {
            admin.permissions.push('view_reports');
            await admin.save();
            console.log('Added "view_reports" permission to admin user');
        } else {
            console.log('Admin already has "view_reports" permission');
        }
        
        // Alternatively, you can add super_admin permission for all access
        if (!admin.permissions.includes('super_admin')) {
            admin.permissions.push('super_admin');
            await admin.save();
            console.log('Added "super_admin" permission');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

addPermissionToAdmin();
