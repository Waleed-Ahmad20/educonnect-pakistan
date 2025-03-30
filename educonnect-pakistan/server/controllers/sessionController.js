const Session = require('../models/sessions');
const { User, Tutor } = require('../models/users');
const mongoose = require('mongoose');

// Create a new session
exports.createSession = async (req, res) => {
    try {
        const { tutorId, subject, topic, date, startTime, endTime, type, location } = req.body;

        if (!tutorId || !subject || !date || !startTime || !endTime || !type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const tutor = await Tutor.findById(tutorId);
        if (!tutor || !tutor.isActive || !tutor.isVerified) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found or not available'
            });
        }

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const durationMinutes = Math.round((end - start) / 60000);

        const price = (tutor.hourlyRate / 60) * durationMinutes;

        const sessionDate = new Date(date);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][sessionDate.getDay()];

        const tutorAvailability = tutor.availability.find(a => a.day === dayOfWeek);
        if (!tutorAvailability) {
            return res.status(400).json({
                success: false,
                message: 'Tutor is not available on this day'
            });
        }

        const isSlotAvailable = tutorAvailability.slots.some(slot =>
            startTime >= slot.startTime && endTime <= slot.endTime
        );

        if (!isSlotAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Selected time slot is not available'
            });
        }

        const existingSession = await Session.findOne({
            tutor: tutorId,
            date: { $eq: new Date(date).setHours(0, 0, 0, 0) },
            startTime,
            status: { $nin: ['cancelled', 'rejected'] }
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'Tutor already has a session scheduled at this time'
            });
        }

        const newSession = new Session({
            tutor: tutorId,
            student: req.user.id,
            subject,
            topic,
            date: sessionDate,
            startTime,
            endTime,
            duration: durationMinutes,
            type,
            price,
            status: 'pending',
            payment: {
                status: 'pending'
            }
        });

        if (type === 'in-person' && location) {
            newSession.location = location;
        }

        if (type === 'online') {
            newSession.meetingLink = `https://meet.example.com/${newSession._id}`;
        }

        await newSession.save();

        res.status(201).json({
            success: true,
            data: newSession
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Session time conflict. Please choose another time'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating session'
        });
    }
};

// Get all sessions
exports.getSessions = async (req, res) => {
    try {
        const { status, startDate, endDate, role } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        if (userRole === 'student') {
            query.student = userId;
            if (role === 'tutor') {
                query = { tutor: userId };
                delete query.student;
            }
        } else if (userRole === 'tutor') {
            query.tutor = userId;
            if (role === 'student') {
                query = { student: userId };
                delete query.tutor;
            }
        } else if (userRole === 'admin') {
            if (role === 'student') {
                query.student = userId;
            } else if (role === 'tutor') {
                query.tutor = userId;
            }
        }

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        const sessions = await Session.find(query)
            .populate('tutor', 'firstName lastName profilePicture')
            .populate('student', 'firstName lastName profilePicture')
            .sort({ date: 1, startTime: 1 });

        res.json({
            success: true,
            data: {
                sessions
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sessions'
        });
    }
};

// Get a specific session by ID
exports.getSessionById = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID format'
            });
        }

        const session = await Session.findById(sessionId)
            .populate('tutor', 'firstName lastName profilePicture bio qualifications subjects hourlyRate averageRating totalReviews')
            .populate('student', 'firstName lastName profilePicture')
            .populate('cancelledBy', 'firstName lastName');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (userRole !== 'admin' &&
            session.student._id.toString() !== userId &&
            session.tutor._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not have permission to view this session'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching session details'
        });
    }
};

// Update a session
exports.updateSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { date, startTime, endTime, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID format'
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (userRole !== 'admin' &&
            session.student.toString() !== userId &&
            session.tutor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not have permission to update this session'
            });
        }

        if (['completed', 'cancelled'].includes(session.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reschedule a ${session.status} session`
            });
        }

        if (date || startTime || endTime) {
            const newDate = date ? new Date(date) : session.date;
            const newStartTime = startTime || session.startTime;
            const newEndTime = endTime || session.endTime;

            if (startTime || endTime) {
                const start = new Date(`2000-01-01T${newStartTime}`);
                const end = new Date(`2000-01-01T${newEndTime}`);
                session.duration = Math.round((end - start) / 60000);
            }

            const existingSession = await Session.findOne({
                _id: { $ne: sessionId },
                tutor: session.tutor,
                date: { $eq: new Date(newDate).setHours(0, 0, 0, 0) },
                startTime: newStartTime,
                status: { $nin: ['cancelled', 'rejected'] }
            });

            if (existingSession) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor already has a session scheduled at this time'
                });
            }

            const tutor = await Tutor.findById(session.tutor);
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][newDate.getDay()];

            const tutorAvailability = tutor.availability.find(a => a.day === dayOfWeek);
            if (!tutorAvailability) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor is not available on this day'
                });
            }

            const isSlotAvailable = tutorAvailability.slots.some(slot =>
                newStartTime >= slot.startTime && newEndTime <= slot.endTime
            );

            if (!isSlotAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected time slot is not available'
                });
            }

            if (date) session.date = newDate;
            if (startTime) session.startTime = newStartTime;
            if (endTime) session.endTime = newEndTime;
        }

        if (status && ['pending', 'confirmed'].includes(status)) {
            session.status = status;
        }

        session.updatedAt = Date.now();

        await session.save();

        res.json({
            success: true,
            data: session
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Session time conflict. Please choose another time'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while updating session'
        });
    }
};

// Update session status
exports.updateSessionStatus = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, reason } = req.body;

        if (!status || !['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (userRole !== 'admin' &&
            session.student.toString() !== userId &&
            session.tutor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not have permission to update this session'
            });
        }

        if (userRole === 'student') {
            if (status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    message: 'Students can only cancel sessions'
                });
            }
        } else if (userRole === 'tutor') {
            if (status === 'pending') {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid status change for tutor'
                });
            }

            if (status === 'completed') {
                const sessionDateTime = new Date(session.date);
                const [hours, minutes] = session.endTime.split(':').map(Number);
                sessionDateTime.setHours(hours, minutes, 0, 0);

                if (sessionDateTime > new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot mark a future session as completed'
                    });
                }
            }
        }

        if ((status === 'cancelled' || status === 'rejected') && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for cancellation or rejection'
            });
        }

        session.status = status;
        session.updatedAt = Date.now();

        if (status === 'cancelled' || status === 'rejected') {
            session.cancellationReason = reason;
            session.cancelledBy = userId;
        }

        await session.save();

        if (status === 'completed') {
            await Tutor.findByIdAndUpdate(session.tutor, {
                $inc: {
                    totalSessions: 1,
                    totalEarnings: session.price
                }
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while updating session status'
        });
    }
};

// Delete/cancel a session
exports.deleteSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (userRole !== 'admin' &&
            session.student.toString() !== userId &&
            session.tutor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not have permission to cancel this session'
            });
        }

        if (session.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed session'
            });
        }

        const sessionDateTime = new Date(session.date);
        const [hours, minutes] = session.startTime.split(':').map(Number);
        sessionDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

        let message = 'Session cancelled successfully';
        if (hoursUntilSession < 24 && hoursUntilSession > 0) {
            message = 'Session cancelled with late cancellation policy applied';
        }

        session.status = 'cancelled';
        session.cancellationReason = 'Cancelled by user';
        session.cancelledBy = userId;
        session.updatedAt = Date.now();

        await session.save();

        res.json({
            success: true,
            message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling session'
        });
    }
};

// Get calendar data
exports.getCalendarData = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        const targetMonth = parseInt(month) - 1;
        const targetYear = parseInt(year);

        if (isNaN(targetMonth) || isNaN(targetYear) ||
            targetMonth < 0 || targetMonth > 11) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month or year provided'
            });
        }

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);

        let query = {
            date: { $gte: startDate, $lte: endDate },
            status: { $nin: ['cancelled', 'rejected'] }
        };

        if (userRole === 'student') {
            query.student = userId;
        } else if (userRole === 'tutor') {
            query.tutor = userId;
        }

        const sessions = await Session.find(query)
            .populate('tutor', 'firstName lastName profilePicture')
            .populate('student', 'firstName lastName profilePicture')
            .sort({ date: 1, startTime: 1 });

        const calendar = {};

        for (let day = 1; day <= endDate.getDate(); day++) {
            calendar[day] = [];
        }

        sessions.forEach(session => {
            const day = session.date.getDate();
            calendar[day].push({
                id: session._id,
                subject: session.subject,
                topic: session.topic,
                startTime: session.startTime,
                endTime: session.endTime,
                type: session.type,
                status: session.status,
                tutor: session.tutor,
                student: session.student
            });
        });

        res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth + 1,
                calendar
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching calendar data'
        });
    }
};

// Get tutor availability
exports.getTutorAvailability = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const { date } = req.query;

        if (!tutorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Tutor ID and date are required'
            });
        }

        const tutor = await Tutor.findById(tutorId);
        if (!tutor || !tutor.isActive || !tutor.isVerified) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found or not available'
            });
        }

        const targetDate = new Date(date);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];

        const dayAvailability = tutor.availability.find(a => a.day === dayOfWeek);
        if (!dayAvailability || !dayAvailability.slots.length) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: 'Tutor does not work on this day',
                    slots: []
                }
            });
        }

        const existingSessions = await Session.find({
            tutor: tutorId,
            date: { $eq: new Date(date).setHours(0, 0, 0, 0) },
            status: { $nin: ['cancelled', 'rejected'] }
        }).select('startTime endTime');

        const availableSlots = [];

        dayAvailability.slots.forEach(slot => {
            let currentSlot = {
                startTime: slot.startTime,
                endTime: slot.endTime
            };

            const remainingSlots = [currentSlot];

            existingSessions.forEach(session => {
                const newRemainingSlots = [];

                remainingSlots.forEach(remainingSlot => {
                    if (session.endTime <= remainingSlot.startTime || session.startTime >= remainingSlot.endTime) {
                        newRemainingSlots.push(remainingSlot);
                        return;
                    }

                    if (session.startTime <= remainingSlot.startTime && session.endTime > remainingSlot.startTime && session.endTime < remainingSlot.endTime) {
                        newRemainingSlots.push({
                            startTime: session.endTime,
                            endTime: remainingSlot.endTime
                        });
                        return;
                    }

                    if (session.startTime > remainingSlot.startTime && session.startTime < remainingSlot.endTime && session.endTime >= remainingSlot.endTime) {
                        newRemainingSlots.push({
                            startTime: remainingSlot.startTime,
                            endTime: session.startTime
                        });
                        return;
                    }

                    if (session.startTime > remainingSlot.startTime && session.endTime < remainingSlot.endTime) {
                        newRemainingSlots.push({
                            startTime: remainingSlot.startTime,
                            endTime: session.startTime
                        });
                        newRemainingSlots.push({
                            startTime: session.endTime,
                            endTime: remainingSlot.endTime
                        });
                        return;
                    }

                    if (session.startTime <= remainingSlot.startTime && session.endTime >= remainingSlot.endTime) {
                        return;
                    }
                });

                if (newRemainingSlots.length > 0) {
                    remainingSlots.length = 0;
                    remainingSlots.push(...newRemainingSlots);
                }
            });

            availableSlots.push(...remainingSlots);
        });

        const validSlots = availableSlots.filter(slot => {
            const start = new Date(`2000-01-01T${slot.startTime}`);
            const end = new Date(`2000-01-01T${slot.endTime}`);
            const durationMinutes = Math.round((end - start) / 60000);
            return durationMinutes >= 30;
        });

        res.json({
            success: true,
            data: {
                tutorId: tutor._id,
                date: targetDate,
                dayOfWeek,
                available: validSlots.length > 0,
                slots: validSlots
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while checking tutor availability'
        });
    }
};

// Export sessions
exports.exportSessions = async (req, res) => {
    try {
        const { format = 'json' } = req.params;
        const { startDate, endDate } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        if (userRole === 'student') {
            query.student = userId;
        } else if (userRole === 'tutor') {
            query.tutor = userId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        const sessions = await Session.find(query)
            .populate('tutor', 'firstName lastName email')
            .populate('student', 'firstName lastName email')
            .sort({ date: 1, startTime: 1 });

        if (format === 'csv') {
            let csv = 'ID,Subject,Date,Start Time,End Time,Status,Type,Price,Student,Tutor\n';

            sessions.forEach(session => {
                const dateStr = session.date.toISOString().split('T')[0];
                const studentName = `${session.student.firstName} ${session.student.lastName}`;
                const tutorName = `${session.tutor.firstName} ${session.tutor.lastName}`;

                csv += `${session._id},${session.subject},${dateStr},${session.startTime},${session.endTime},`;
                csv += `${session.status},${session.type},${session.price},${studentName},${tutorName}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=sessions.csv');
            return res.send(csv);
        } else {
            res.json({
                success: true,
                data: {
                    sessions
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while exporting sessions'
        });
    }
};

// Get sessions for the authenticated student
exports.getStudentSessions = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const sessions = await Session.find({ student: studentId })
            .populate('tutor', 'firstName lastName profilePicture hourlyRate subjects')
            .sort({ date: -1, startTime: 1 });

        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (err) {
        console.error('Error fetching student sessions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sessions'
        });
    }
};

// Get sessions for the authenticated student that need reviews
exports.getStudentPendingReviews = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Find completed sessions that don't have reviews yet
        const sessions = await Session.find({ 
            student: studentId,
            status: 'completed',
            // We want sessions that don't have a review yet
            hasStudentReview: { $ne: true }
        })
        .populate('tutor', 'firstName lastName profilePicture')
        .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: sessions || []
        });
    } catch (err) {
        console.error('Error fetching pending reviews:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending reviews'
        });
    }
};

// Get sessions for the authenticated tutor
exports.getTutorSessions = async (req, res) => {
    try {
        const tutorId = req.user.id;
        const { status, startDate, endDate, limit } = req.query;

        if (!tutorId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const query = { tutor: tutorId };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        let sessionLimit = limit ? parseInt(limit) : 0; // Default to no limit if not provided or invalid

        const sessions = await Session.find(query)
            .populate('student', 'firstName lastName profilePicture')
            .sort({ date: 1, startTime: 1 })
            .limit(Math.max(0, sessionLimit)); // Ensure limit is not negative

        res.json({
            success: true,
            data: sessions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sessions'
        });
    }
};

// Get tutor session statistics
exports.getTutorSessionStats = async (req, res) => {
    try {
        const tutorId = req.user.id;
        
        if (!tutorId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Count sessions by status
        const upcoming = await Session.countDocuments({
            tutor: tutorId,
            status: 'upcoming'
        });
        
        const completed = await Session.countDocuments({
            tutor: tutorId,
            status: 'completed'
        });
        
        const cancelled = await Session.countDocuments({
            tutor: tutorId,
            status: { $in: ['cancelled', 'rejected'] }
        });
        
        const total = await Session.countDocuments({
            tutor: tutorId
        });
        
        res.json({
            success: true,
            data: {
                upcoming,
                completed,
                cancelled,
                total
            }
        });
    } catch (err) {
        console.error('Error fetching tutor session stats:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching session statistics'
        });
    }
};