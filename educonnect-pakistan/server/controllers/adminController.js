const VerificationRequest = require('../models/verificationRequests');
const { User, Tutor } = require('../models/users');
const Session = require('../models/sessions');
const {
    Report,
    UserGrowthReport,
    SessionReport,
    PopularSubjectReport,
    CityUsageReport
} = require('../models/reports');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Verification Request Controllers
exports.getVerificationRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: {
                path: 'tutor',
                select: 'firstName lastName email qualifications'
            }
        };

        const total = await VerificationRequest.countDocuments(query);
        const requests = await VerificationRequest.find(query)
            .populate('tutor', 'firstName lastName email qualifications')
            .sort({ createdAt: -1 })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);

        return res.json({
            success: true,
            data: {
                requests,
                total,
                page: options.page,
                limit: options.limit
            }
        });
    } catch (err) {
        console.error('Error fetching verification requests:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching verification requests'
        });
    }
};

exports.getVerificationRequestById = async (req, res) => {
    try {
        const verificationRequest = await VerificationRequest.findById(req.params.id)
            .populate('tutor', 'firstName lastName email qualifications subjects bio hourlyRate')
            .populate('reviewedBy', 'firstName lastName');

        if (!verificationRequest) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        return res.json({
            success: true,
            data: verificationRequest
        });
    } catch (err) {
        console.error('Error fetching verification request:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching verification request'
        });
    }
};

exports.updateVerificationRequest = async (req, res) => {
    try {
        const { status, adminComments, rejectionReason } = req.body;
        const allowedStatuses = ['under_review', 'approved', 'rejected', 'additional_info_requested'];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        const verificationRequest = await VerificationRequest.findById(req.params.id);

        if (!verificationRequest) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        verificationRequest.status = status;
        verificationRequest.adminComments = adminComments || verificationRequest.adminComments;
        verificationRequest.rejectionReason = rejectionReason || verificationRequest.rejectionReason;
        verificationRequest.reviewedBy = req.user.id;
        verificationRequest.reviewedAt = Date.now();
        verificationRequest.updatedAt = Date.now();

        await verificationRequest.save();

        if (status === 'approved') {
            await Tutor.findByIdAndUpdate(verificationRequest.tutor, {
                isVerified: true
            });
        }

        return res.json({
            success: true,
            data: verificationRequest
        });
    } catch (err) {
        console.error('Error processing verification request:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing verification request'
        });
    }
};

// Report Controllers
exports.getUserGrowthReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const report = await generateUserGrowthReport(start, end);

        return res.json({
            success: true,
            data: report
        });
    } catch (err) {
        console.error('Error fetching user growth report:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching user growth report'
        });
    }
};

exports.getSessionCompletionReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const report = await generateSessionCompletionReport(start, end);

        return res.json({
            success: true,
            data: report
        });
    } catch (err) {
        console.error('Error fetching session completion report:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching session completion report'
        });
    }
};

exports.getPopularSubjectsReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const report = await generatePopularSubjectsReport(start, end);

        return res.json({
            success: true,
            data: report
        });
    } catch (err) {
        console.error('Error fetching popular subjects report:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching popular subjects report'
        });
    }
};

exports.getCityUsageReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const report = await generateCityUsageReport(start, end);

        return res.json({
            success: true,
            data: report
        });
    } catch (err) {
        console.error('Error fetching city usage report:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching city usage report'
        });
    }
};

exports.exportReport = async (req, res) => {
    try {
        const { reportType } = req.params;
        const { startDate, endDate, format = 'csv' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        let reportData;

        switch (reportType) {
            case 'user-growth':
                reportData = await generateUserGrowthReport(start, end);
                break;
            case 'session-completion':
                reportData = await generateSessionCompletionReport(start, end);
                break;
            case 'popular-subjects':
                reportData = await generatePopularSubjectsReport(start, end);
                break;
            case 'city-usage':
                reportData = await generateCityUsageReport(start, end);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        if (format === 'csv') {
            return exportCsv(res, reportData, reportType);
        } else if (format === 'pdf') {
            return exportPdf(res, reportData, reportType);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid export format'
            });
        }
    } catch (err) {
        console.error('Error exporting report:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while exporting report'
        });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        console.log('Fetching admin stats');
        
        // Get total users count
        const totalUsers = await User.countDocuments();
        
        // Get total tutors count
        const totalTutors = await User.countDocuments({ role: 'tutor' });
        
        // Get total students count
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // Get total sessions count
        const totalSessions = await Session.countDocuments();
        
        // Get pending verification requests count
        const pendingVerifications = await VerificationRequest.countDocuments({
            status: { $in: ['pending', 'under_review'] }
        });
        
        console.log('Admin stats collected successfully');
        
        return res.json({
            success: true,
            data: {
                totalUsers,
                totalTutors,
                totalStudents,
                totalSessions,
                pendingVerifications
            }
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching admin statistics'
        });
    }
};

// Report Generation Helpers
async function generateUserGrowthReport(startDate, endDate) {
    const report = await UserGrowthReport.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (report.length === 0) {
        const aggregatedData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        const formattedData = formatUserGrowthReport(aggregatedData, startDate, endDate);

        await saveReportData('user_growth', startDate, endDate, formattedData);

        return formattedData;
    }

    return report;
}

async function generateSessionCompletionReport(startDate, endDate) {
    const report = await SessionReport.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (report.length === 0) {
        const aggregatedData = await Session.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        status: "$status",
                        type: "$type"
                    },
                    count: { $sum: 1 },
                    totalDuration: { $sum: "$duration" },
                    totalEarnings: { $sum: "$price" }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        const formattedData = formatSessionCompletionReport(aggregatedData, startDate, endDate);

        await saveReportData('session_completion', startDate, endDate, formattedData);

        return formattedData;
    }

    return report;
}

async function generatePopularSubjectsReport(startDate, endDate) {
    const report = await PopularSubjectReport.find({}).sort({ sessionCount: -1 });

    if (report.length === 0) {
        const aggregatedData = await Session.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$subject",
                    sessionCount: { $sum: 1 },
                    studentCount: { $addToSet: "$student" },
                    tutorCount: { $addToSet: "$tutor" }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    sessionCount: 1,
                    studentCount: { $size: "$studentCount" },
                    tutorCount: { $size: "$tutorCount" }
                }
            },
            {
                $sort: { sessionCount: -1 }
            }
        ]);

        const formattedData = formatPopularSubjectsReport(aggregatedData);

        await saveReportData('popular_subjects', startDate, endDate, formattedData);

        return formattedData;
    }

    return report;
}

async function generateCityUsageReport(startDate, endDate) {
    const report = await CityUsageReport.find({}).sort({ sessionCount: -1 });

    if (report.length === 0) {
        const aggregatedData = await Session.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    "location.city": { $exists: true, $ne: "" }
                }
            },
            {
                $group: {
                    _id: "$location.city",
                    sessionCount: { $sum: 1 },
                    studentCount: { $addToSet: "$student" },
                    tutorCount: { $addToSet: "$tutor" },
                    totalEarnings: { $sum: "$price" }
                }
            },
            {
                $project: {
                    city: "$_id",
                    sessionCount: 1,
                    studentCount: { $size: "$studentCount" },
                    tutorCount: { $size: "$tutorCount" },
                    totalEarnings: 1
                }
            },
            {
                $sort: { sessionCount: -1 }
            }
        ]);

        const tutorCities = await Tutor.aggregate([
            {
                $match: {
                    "location.city": { $exists: true, $ne: "" }
                }
            },
            {
                $group: {
                    _id: "$location.city",
                    tutorCount: { $sum: 1 }
                }
            }
        ]);

        const formattedData = formatCityUsageReport(aggregatedData, tutorCities);

        await saveReportData('city_usage', startDate, endDate, formattedData);

        return formattedData;
    }

    return report;
}

// Helper Functions for Formatting Reports
function formatUserGrowthReport(data, startDate, endDate) {
    const reportData = [];

    const dateMap = new Map();
    data.forEach(item => {
        const dateStr = item._id.date;
        if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, {
                date: new Date(dateStr),
                newStudents: 0,
                newTutors: 0,
                totalStudents: 0,
                totalTutors: 0,
                activeStudents: 0,
                activeTutors: 0
            });
        }

        const entry = dateMap.get(dateStr);
        if (item._id.role === 'student') {
            entry.newStudents = item.count;
        } else if (item._id.role === 'tutor') {
            entry.newTutors = item.count;
        }
    });

    const sortedData = Array.from(dateMap.values()).sort((a, b) => a.date - b.date);

    let totalStudents = 0;
    let totalTutors = 0;

    sortedData.forEach(item => {
        totalStudents += item.newStudents;
        totalTutors += item.newTutors;

        item.totalStudents = totalStudents;
        item.totalTutors = totalTutors;

        item.activeStudents = Math.round(totalStudents * 0.8);
        item.activeTutors = Math.round(totalTutors * 0.8);

        reportData.push(item);
    });

    return reportData;
}

function formatSessionCompletionReport(data, startDate, endDate) {
    const reportData = [];

    const dateMap = new Map();
    data.forEach(item => {
        const dateStr = item._id.date;
        if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, {
                date: new Date(dateStr),
                totalSessions: 0,
                completedSessions: 0,
                cancelledSessions: 0,
                onlineSessions: 0,
                inPersonSessions: 0,
                totalDuration: 0,
                totalEarnings: 0
            });
        }

        const entry = dateMap.get(dateStr);
        entry.totalSessions += item.count;

        if (item._id.status === 'completed') {
            entry.completedSessions += item.count;
        } else if (item._id.status === 'cancelled') {
            entry.cancelledSessions += item.count;
        }

        if (item._id.type === 'online') {
            entry.onlineSessions += item.count;
        } else if (item._id.type === 'in-person') {
            entry.inPersonSessions += item.count;
        }

        entry.totalDuration += item.totalDuration || 0;
        entry.totalEarnings += item.totalEarnings || 0;
    });

    const sortedData = Array.from(dateMap.values()).sort((a, b) => a.date - b.date);

    return sortedData;
}

function formatPopularSubjectsReport(data) {
    return data.map(item => ({
        subject: item.subject,
        sessionCount: item.sessionCount,
        studentCount: item.studentCount,
        tutorCount: item.tutorCount,
        averageRating: 0
    }));
}

function formatCityUsageReport(sessionData, tutorData) {
    const cityMap = new Map();

    sessionData.forEach(item => {
        cityMap.set(item.city, {
            city: item.city,
            tutorCount: item.tutorCount,
            studentCount: item.studentCount,
            sessionCount: item.sessionCount,
            totalEarnings: item.totalEarnings
        });
    });

    tutorData.forEach(item => {
        const city = item._id;
        if (!cityMap.has(city)) {
            cityMap.set(city, {
                city: city,
                tutorCount: item.tutorCount,
                studentCount: 0,
                sessionCount: 0,
                totalEarnings: 0
            });
        }
    });

    return Array.from(cityMap.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}

// Database Functions
async function saveReportData(reportType, startDate, endDate, data) {
    try {
        const report = new Report({
            reportType,
            dateRange: {
                startDate,
                endDate
            },
            data,
            createdAt: Date.now()
        });

        await report.save();
    } catch (err) {
        console.error('Error saving report data:', err);
    }
}

// Export Functions
function exportCsv(res, data, reportType) {
    const csvWriter = createCsvWriter({
        path: `./tmp/${reportType}-${Date.now()}.csv`,
        header: getHeadersForReportType(reportType)
    });

    csvWriter.writeRecords(data)
        .then(() => {
            res.download(`./tmp/${reportType}-${Date.now()}.csv`, `${reportType}-report.csv`, (err) => {
                if (err) {
                    console.error('Error downloading CSV:', err);
                }

                fs.unlink(`./tmp/${reportType}-${Date.now()}.csv`, (err) => {
                    if (err) console.error('Error deleting temporary CSV file:', err);
                });
            });
        });
}

function exportPdf(res, data, reportType) {
    const doc = new PDFDocument();
    const fileName = `${reportType}-${Date.now()}.pdf`;
    const filePath = `./tmp/${fileName}`;

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text(`${formatReportTitle(reportType)} Report`, {
        align: 'center'
    });

    doc.moveDown();
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, {
        align: 'center'
    });

    doc.moveDown();

    const headers = getHeadersForReportType(reportType);
    const startX = 50;
    let startY = doc.y + 20;
    const colWidth = (doc.page.width - 100) / headers.length;

    doc.fontSize(10);

    headers.forEach((header, i) => {
        doc.text(header.title, startX + (i * colWidth), startY, {
            width: colWidth,
            align: 'center'
        });
    });

    startY += 20;

    doc.moveTo(startX, startY).lineTo(startX + (headers.length * colWidth), startY).stroke();

    startY += 10;

    data.forEach((row, rowIndex) => {
        headers.forEach((header, colIndex) => {
            let value = row[header.id];

            if (header.id.includes('Date') || header.id === 'date') {
                value = new Date(value).toLocaleDateString();
            } else if (typeof value === 'number') {
                if (header.id.includes('percentage') || header.id.includes('Rating')) {
                    value = `${value.toFixed(2)}%`;
                } else if (header.id.includes('total') || header.id.includes('Count') || header.id.includes('Earnings')) {
                    value = value.toLocaleString();
                }
            }

            doc.text(value || '—', startX + (colIndex * colWidth), startY, {
                width: colWidth,
                align: 'center'
            });
        });

        startY += 20;

        if (startY > doc.page.height - 50) {
            doc.addPage();
            startY = 50;
        }
    });

    doc.end();

    stream.on('finish', () => {
        res.download(filePath, `${reportType}-report.pdf`, (err) => {
            if (err) {
                console.error('Error downloading PDF:', err);
            }

            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting temporary PDF file:', err);
            });
        });
    });
}

function getHeadersForReportType(reportType) {
    switch (reportType) {
        case 'user-growth':
            return [
                { id: 'date', title: 'Date' },
                { id: 'newStudents', title: 'New Students' },
                { id: 'newTutors', title: 'New Tutors' },
                { id: 'totalStudents', title: 'Total Students' },
                { id: 'totalTutors', title: 'Total Tutors' },
                { id: 'activeStudents', title: 'Active Students' },
                { id: 'activeTutors', title: 'Active Tutors' }
            ];
        case 'session-completion':
            return [
                { id: 'date', title: 'Date' },
                { id: 'totalSessions', title: 'Total Sessions' },
                { id: 'completedSessions', title: 'Completed' },
                { id: 'cancelledSessions', title: 'Cancelled' },
                { id: 'onlineSessions', title: 'Online' },
                { id: 'inPersonSessions', title: 'In-Person' },
                { id: 'totalDuration', title: 'Total Hours' },
                { id: 'totalEarnings', title: 'Total Earnings' }
            ];
        case 'popular-subjects':
            return [
                { id: 'subject', title: 'Subject' },
                { id: 'sessionCount', title: 'Sessions' },
                { id: 'studentCount', title: 'Students' },
                { id: 'tutorCount', title: 'Tutors' },
                { id: 'averageRating', title: 'Avg Rating' }
            ];
        case 'city-usage':
            return [
                { id: 'city', title: 'City' },
                { id: 'tutorCount', title: 'Tutors' },
                { id: 'studentCount', title: 'Students' },
                { id: 'sessionCount', title: 'Sessions' },
                { id: 'totalEarnings', title: 'Total Earnings' }
            ];
        default:
            return [];
    }
}

function formatReportTitle(reportType) {
    switch (reportType) {
        case 'user-growth':
            return 'User Growth';
        case 'session-completion':
            return 'Session Completion';
        case 'popular-subjects':
            return 'Popular Subjects';
        case 'city-usage':
            return 'City Usage';
        default:
            return reportType;
    }
}