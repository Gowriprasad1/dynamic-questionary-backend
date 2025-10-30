const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/submissionController');

// Submit form data
router.post('/', [
  body('formId').isMongoId().withMessage('Valid form ID is required'),
  body('data').isObject().withMessage('Data must be an object')
], ctrl.submit);

// Get all submissions for a form
router.get('/form/:formId', ctrl.getByForm);

// Get submission by ID
router.get('/:id', ctrl.getById);

// Get all submissions
router.get('/', ctrl.getAll);

module.exports = router;
