const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'additional_info_requested'],
    default: 'pending'
  },
  documents: [
    {
      title: String,
      type: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  adminComments: String,
  rejectionReason: String,
  additionalInfoRequested: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);