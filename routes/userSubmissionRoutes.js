const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userSubmissionController');

// Thin router delegating to controller (no functionality changes)
router.get('/questions/:category', ctrl.getQuestionsByCategory);
router.post('/lookup', ctrl.lookup);
router.post('/send-otp', ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/save-question', ctrl.saveQuestion);
router.get('/progress', ctrl.getProgress);
router.post('/check-duplicate', ctrl.checkDuplicate);
router.post('/submit', ctrl.submitAnswers);
router.get('/submissions/:category', ctrl.getSubmissionsByCategory);
router.get('/stats', ctrl.getStats);

module.exports = router;
