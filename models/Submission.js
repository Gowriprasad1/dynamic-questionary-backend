const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model('Submission', submissionSchema);
