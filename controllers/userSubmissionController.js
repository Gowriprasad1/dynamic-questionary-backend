const mongoose = require('mongoose');
const UserSubmission = require('../models/UserSubmission');
const Form = require('../models/Form');
const Category = require('../models/Category');
const Otp = require('../models/Otp');

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes
const OTP_MAX_ATTEMPTS = 5;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get all questions for a specific category
async function getQuestionsByCategory(req, res) {
  try {
    const { category } = req.params;

    const categoryDoc = await Category.findOne({ name: category, isActive: true });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const forms = await Form.find({ isActive: true });

    const categoryQuestions = [];
    forms.forEach(form => {
      form.questions.forEach(question => {
        if (question.questionType === category) {
          categoryQuestions.push({
            ...question.toObject(),
            formId: form._id,
            formTitle: form.title
          });
        }
      });
    });

    categoryQuestions.sort((a, b) => a.order - b.order);

    res.json({ category, questions: categoryQuestions, totalQuestions: categoryQuestions.length });
  } catch (error) {
    console.error('Error fetching category questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
}

// Lookup application by appNumber (stub)
async function lookup(req, res) {
  try {
    const { appNumber } = req.body;
    if (!appNumber) return res.status(400).json({ message: 'appNumber is required' });

    const data = {
      Name: 'HariPrasad',
      Appnumber: appNumber,
      Mobile: '8688520261',
      Gender: 'Male',
      dob: '14/06/2001'
    };

    return res.json(data);
  } catch (err) {
    console.error('Lookup error', err);
    return res.status(500).json({ message: 'Lookup failed', error: err.message });
  }
}

// Send OTP (simulated)
async function sendOtp(req, res) {
  try {
    const { mobile, appNumber } = req.body;
    if (!mobile && !appNumber) return res.status(400).json({ message: 'mobile or appNumber required' });
    const keyMobile = mobile || appNumber;
    const otp = generateOtp();
    const now = Date.now();
    console.log(otp, 'otp');

    await Otp.deleteMany({ mobile: keyMobile });

    const otpDoc = new Otp({
      mobile: keyMobile,
      appNumber: appNumber || null,
      otp,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt: new Date(now + OTP_TTL_MS)
    });
    await otpDoc.save();

    console.log(`OTP for ${keyMobile}: ${otp} (expires in ${OTP_TTL_MS / 1000}s)`);
    return res.json({ success: true, message: 'OTP sent (simulated)' });
  } catch (err) {
    console.error('Send OTP error', err);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
}

// Verify OTP
async function verifyOtp(req, res) {
  try {
    const { mobile, otp } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'mobile required' });

    const otpDoc = await Otp.findOne({ mobile }).sort({ createdAt: -1 }).exec();
    if (!otpDoc) return res.json({ success: false, message: 'No OTP requested' });

    const now = new Date();
    if (otpDoc.expiresAt && now > otpDoc.expiresAt) {
      await Otp.deleteMany({ mobile });
      return res.json({ success: false, message: 'OTP expired' });
    }
    if (otpDoc.attempts >= (otpDoc.maxAttempts || OTP_MAX_ATTEMPTS)) {
      return res.json({ success: false, message: 'Max attempts exceeded' });
    }

    if (otpDoc.otp === otp) {
      await Otp.deleteMany({ mobile });
      return res.json({ success: true, message: 'Verified' });
    }

    otpDoc.attempts = (otpDoc.attempts || 0) + 1;
    await otpDoc.save();
    return res.json({ success: false, message: 'Invalid OTP' });
  } catch (err) {
    console.error('Verify OTP error', err);
    return res.status(500).json({ message: 'OTP verify failed', error: err.message });
  }
}

// Save questions + answers (draft upsert -> active)
async function saveQuestion(req, res) {
  try {
    const { appNumber, mobile, category, answers } = req.body;
    if (!category) return res.status(400).json({ message: 'category is required' });
    if (!answers || typeof answers !== 'object') return res.status(400).json({ message: 'answers are required' });

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const filter = appNumber ? { category, appNumber } : (mobile ? { category, mobile } : { category });
    const update = {
      $set: {
        category,
        appNumber: appNumber || null,
        mobile: mobile || null,
        answers,
        status: 'active',
        ipAddress,
        userAgent,
        updatedAt: new Date()
      }
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const submission = await UserSubmission.findOneAndUpdate(filter, update, options);

    return res.status(200).json({ success: true, message: 'Draft saved', submissionId: submission._id });
  } catch (err) {
    console.error('save-question error', err);
    return res.status(500).json({ success: false, message: 'Failed to save', error: err.message });
  }
}

// Get latest saved progress by category + appNumber or mobile
async function getProgress(req, res) {
  try {
    const { category, appNumber, mobile } = req.query;
    if (!category) return res.status(400).json({ message: 'category is required' });
    const filter = { category };
    if (appNumber) filter.appNumber = appNumber;
    if (mobile) filter.mobile = mobile;

    const doc = await UserSubmission.findOne(filter).sort({ updatedAt: -1, createdAt: -1 }).lean();
    if (!doc) return res.status(404).json({ message: 'No progress found' });
    return res.json({ success: true, progress: { answers: doc.answers || {}, appNumber: doc.appNumber || null, mobile: doc.mobile || null, updatedAt: doc.updatedAt || doc.createdAt } });
  } catch (err) {
    console.error('getProgress error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch progress', error: err.message });
  }
}

// Check duplicate by category + appNumber, only if already submitted
async function checkDuplicate(req, res) {
  try {
    const { category, appNumber } = req.body;

    if (!appNumber || !category) {
      return res.status(400).json({ message: 'Application number and category are required' });
    }

    const existingSubmission = await UserSubmission.findOne({ category, appNumber, status: 'submitted' });

    if (existingSubmission) {
      return res.status(200).json({
        isDuplicate: true,
        message: 'Questionnaire already submitted with this application number and category'
      });
    }

    return res.status(200).json({ isDuplicate: false });
  } catch (error) {
    console.error('Error checking duplicate submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Submit answers (upsert if appNumber present) -> mark as submitted
async function submitAnswers(req, res) {
  try {
    const { category, answers, appNumber, mobile } = req.body;

    const categoryDoc = await Category.findOne({ name: category, isActive: true });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    if (appNumber) {
      const existingSubmission = await UserSubmission.findOne({ category, appNumber, status: 'submitted' });
      if (existingSubmission) {
        return res.status(409).json({
          message: 'Questionnaire already submitted with this application number and category',
          isDuplicate: true
        });
      }
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const filter = appNumber ? { category, appNumber } : { _id: new mongoose.Types.ObjectId() };

    const updateFields = { category, answers, status: 'submitted', ipAddress, userAgent, submittedAt: new Date() };
    if (mobile) updateFields.mobile = mobile;
    if (appNumber) updateFields.appNumber = appNumber;

    const update = { $set: updateFields };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const submission = await UserSubmission.findOneAndUpdate(filter, update, options);

    res.status(appNumber ? 200 : 201).json({
      message: appNumber ? 'Submission updated successfully' : 'Submission successful',
      submissionId: submission._id,
      category: submission.category,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ message: 'Error submitting answers', error: error.message });
  }
}

// Get submissions by category
async function getSubmissionsByCategory(req, res) {
  try {
    const { category } = req.params;

    const submissions = await UserSubmission.find({ category })
      .sort({ submittedAt: -1 })
      .limit(100);

    res.json({ category, submissions, total: submissions.length });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
}

// Stats
async function getStats(req, res) {
  try {
    const stats = await UserSubmission.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, latestSubmission: { $max: '$submittedAt' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
}

module.exports = {
  getQuestionsByCategory,
  lookup,
  sendOtp,
  verifyOtp,
  saveQuestion,
  getProgress,
  checkDuplicate,
  submitAnswers,
  getSubmissionsByCategory,
  getStats
};
