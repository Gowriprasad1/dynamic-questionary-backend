const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userSubmissionController');
const requireOtp = require('../middleware/otpAuth');

// Thin router delegating to controller (no functionality changes)
router.get('/questions/:category', requireOtp, ctrl.getQuestionsByCategory);
router.post('/lookup', ctrl.lookup);
router.post('/send-otp', ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/save-question', requireOtp, ctrl.saveQuestion);
router.get('/progress', requireOtp, ctrl.getProgress);
router.post('/check-duplicate', ctrl.checkDuplicate);
router.post('/submit', requireOtp, ctrl.submitAnswers);
router.get('/submissions/:category', ctrl.getSubmissionsByCategory);
router.get('/stats', ctrl.getStats);

module.exports = router;
