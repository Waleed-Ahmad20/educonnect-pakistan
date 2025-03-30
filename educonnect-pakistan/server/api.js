const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { checkAuth } = require('./middleware/auth');

const router = express.Router();

router.use(helmet());

router.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    }
});
router.use(limiter);


router.use(express.json({ limit: '10kb' }));
router.use(express.urlencoded({ extended: true, limit: '10kb' }));


router.use(mongoSanitize());


router.use(xss());


router.use(hpp({
    whitelist: [
        'subject',
        'location',
        'priceMin',
        'priceMax',
        'rating',
        'status',
        'startDate',
        'endDate'
    ]
}));


if (process.env.NODE_ENV === 'development') {
    router.use(morgan('dev'));
} else {
    router.use(morgan('combined'));
}


router.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});


router.get('/docs', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Documentation',
        apiVersion: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tutors: '/api/tutors',
            students: '/api/students',
            sessions: '/api/sessions',
            admin: '/api/admin',
            reviews: '/api/reviews',
            notifications: '/api/notifications'
        }
    });
});


const apiPrefix = '/api';


module.exports = {
    router,
    apiPrefix
};