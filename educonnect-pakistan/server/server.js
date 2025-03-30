const express = require('express');
const mongoose = require('mongoose');
const { router: apiRouter, apiPrefix } = require('./api');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(apiPrefix, apiRouter);

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/tutors`, tutorRoutes);
app.use(`${apiPrefix}/students`, studentRoutes);
app.use(`${apiPrefix}/sessions`, sessionRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });