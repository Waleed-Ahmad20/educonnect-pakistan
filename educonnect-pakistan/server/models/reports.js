const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    reportType: {
        type: String,
        enum: ['user_growth', 'session_completion', 'popular_subjects', 'city_usage',
            'earnings', 'ratings', 'complaints', 'custom'],
        required: true
    },
    dateRange: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    filters: {
        type: Schema.Types.Mixed
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

reportSchema.index({ reportType: 1, 'dateRange.startDate': 1, 'dateRange.endDate': 1 });


const userGrowthReportSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    newStudents: {
        type: Number,
        default: 0
    },
    newTutors: {
        type: Number,
        default: 0
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    totalTutors: {
        type: Number,
        default: 0
    },
    activeStudents: {
        type: Number,
        default: 0
    },
    activeTutors: {
        type: Number,
        default: 0
    }
});

const sessionReportSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    completedSessions: {
        type: Number,
        default: 0
    },
    cancelledSessions: {
        type: Number,
        default: 0
    },
    onlineSessions: {
        type: Number,
        default: 0
    },
    inPersonSessions: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    }
});

const popularSubjectSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    level: {
        type: String
    },
    sessionCount: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    tutorCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    }
});

const cityUsageSchema = new Schema({
    city: {
        type: String,
        required: true
    },
    tutorCount: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    sessionCount: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    }
});


const UserGrowthReport = mongoose.model('UserGrowthReport', userGrowthReportSchema);
const SessionReport = mongoose.model('SessionReport', sessionReportSchema);
const PopularSubjectReport = mongoose.model('PopularSubjectReport', popularSubjectSchema);
const CityUsageReport = mongoose.model('CityUsageReport', cityUsageSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
    Report,
    UserGrowthReport,
    SessionReport,
    PopularSubjectReport,
    CityUsageReport
};
