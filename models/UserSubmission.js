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
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Index for faster queries
userSubmissionSchema.index({ category: 1, submittedAt: -1 });

module.exports = mongoose.model('UserSubmission', userSubmissionSchema);
