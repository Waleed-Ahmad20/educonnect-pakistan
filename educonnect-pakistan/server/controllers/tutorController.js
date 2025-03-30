const { Tutor } = require('../models/users');
const VerificationRequest = require('../models/verificationRequests');

// Get all tutors with filtering
exports.getAllTutors = async (req, res) => {
    try {
        const {
            subject,
            location,
            priceMin,
            priceMax,
            rating,
            availability,
            page = 1,
            limit = 10
        } = req.query;

        const query = { role: 'tutor', isActive: true };

        if (subject) {
            query['subjects.name'] = { $regex: subject, $options: 'i' };
        }

        if (location) {
            query['location.city'] = { $regex: location, $options: 'i' };
        }

        if (priceMin || priceMax) {
            query.hourlyRate = {};
            if (priceMin) query.hourlyRate.$gte = Number(priceMin);
            if (priceMax) query.hourlyRate.$lte = Number(priceMax);
        }

        if (rating) {
            query.averageRating = { $gte: Number(rating) };
        }

        if (availability) {
            const [day, timeSlot] = availability.split(',');
            if (day) {
                query['availability.day'] = day.toLowerCase();
                if (timeSlot) {
                    query['availability.slots'] = {
                        $elemMatch: {
                            startTime: { $lte: timeSlot },
                            endTime: { $gte: timeSlot }
                        }
                    };
                }
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const tutors = await Tutor.find(query)
            .select('-password -bankDetails')
            .skip(skip)
            .limit(Number(limit))
            .sort({ averageRating: -1 });

        const total = await Tutor.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                tutors,
                total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Get single tutor by ID
exports.getTutorById = async (req, res) => {
    try {
        const tutor = await Tutor.findOne({
            _id: req.params.id,
            role: 'tutor',
            isActive: true
        }).select('-password -bankDetails');

        if (!tutor) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        const reviews = [];

        res.status(200).json({
            success: true,
            data: {
                ...tutor.toObject(),
                reviews
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Update tutor profile
exports.updateTutorProfile = async (req, res) => {
    try {
        const {
            bio,
            qualifications,
            subjects,
            hourlyRate,
            location,
            teachingPreference,
            availability
        } = req.body;

        const tutor = await Tutor.findByIdAndUpdate(
            req.user.id,
            {
                bio,
                qualifications,
                subjects,
                hourlyRate,
                location,
                teachingPreference,
                availability,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!tutor) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: tutor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Update tutor availability
exports.updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;

        if (!availability || !Array.isArray(availability)) {
            return res.status(400).json({
                success: false,
                error: 'Valid availability array is required'
            });
        }

        for (const slot of availability) {
            if (!slot.day || !slot.slots || !Array.isArray(slot.slots)) {
                return res.status(400).json({
                    success: false,
                    error: 'Each availability must have a day and slots array'
                });
            }

            for (const timeSlot of slot.slots) {
                if (!timeSlot.startTime || !timeSlot.endTime) {
                    return res.status(400).json({
                        success: false,
                        error: 'Each time slot must have startTime and endTime'
                    });
                }
            }
        }

        const tutor = await Tutor.findByIdAndUpdate(
            req.user.id,
            {
                availability,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('availability');

        if (!tutor) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { availability: tutor.availability }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Update hourly rate
exports.updateHourlyRate = async (req, res) => {
    try {
        const { hourlyRate } = req.body;

        if (hourlyRate === undefined || hourlyRate < 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid hourly rate is required'
            });
        }

        const tutor = await Tutor.findByIdAndUpdate(
            req.user.id,
            {
                hourlyRate,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('hourlyRate');

        if (!tutor) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { hourlyRate: tutor.hourlyRate }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Get tutor earnings
exports.getTutorEarnings = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.user.id).select('totalEarnings totalSessions');

        if (!tutor) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        const earnings = {
            totalEarnings: tutor.totalEarnings,
            totalSessions: tutor.totalSessions,
        };

        res.status(200).json({
            success: true,
            data: earnings
        });
    } catch (error) {
        console.error("Error fetching tutor earnings:", error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Upload verification documents
exports.uploadDocuments = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please upload at least one document'
            });
        }

        const documents = req.files.map(file => ({
            type: req.body.documentType || 'other',
            title: req.body.title || file.originalname,
            fileUrl: file.path,
            uploadedAt: Date.now()
        }));

        let verificationRequest = await VerificationRequest.findOne({ tutor: req.user.id });

        if (verificationRequest) {
            verificationRequest.documents.push(...documents);
            verificationRequest.status = 'pending';
            verificationRequest.updatedAt = Date.now();
            await verificationRequest.save();
        } else {
            verificationRequest = await VerificationRequest.create({
                tutor: req.user.id,
                documents,
                status: 'pending'
            });
        }

        res.status(200).json({
            success: true,
            data: { documents: verificationRequest.documents }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

// Get verification status
exports.getVerificationStatus = async (req, res) => {
    try {
        const tutorId = req.user.id;

        // Find the tutor to check if they are verified
        const tutor = await Tutor.findById(tutorId);

        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }

        // Check if verification request exists
        const verificationRequest = await VerificationRequest.findOne({
            tutor: tutorId
        }).sort({ createdAt: -1 }); // Get the latest request

        // Default response if no verification request found
        const response = {
            isVerified: tutor.isVerified || false,
            status: verificationRequest ? verificationRequest.status : 'not_submitted',
            comments: verificationRequest ? (verificationRequest.adminComments || verificationRequest.rejectionReason || '') : '',
            updatedAt: verificationRequest ? verificationRequest.updatedAt : null
        };

        return res.json({
            success: true,
            data: response
        });

    } catch (err) {
        console.error('Error fetching verification status:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching verification status'
        });
    }
};