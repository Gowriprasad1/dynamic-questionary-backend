const mongoose = require('mongoose');

const userSubmissionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  appNumber: {
    type: String,
    required: false,
    index: true
  },
  mobile: {
    type: String,
    required: false,
    index: true
  },
  answers: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    questionId: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'submitted'],
    default: 'active',
    index: true
  },
  pageNumber: {
    type: Number,
    default: 1
  },
  submittedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
userSubmissionSchema.index({ category: 1, appNumber: 1, status: 1 });
userSubmissionSchema.index({ category: 1, submittedAt: -1 });

module.exports = mongoose.model('UserSubmission', userSubmissionSchema);
