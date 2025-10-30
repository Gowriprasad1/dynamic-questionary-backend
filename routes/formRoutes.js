const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Category = require('../models/Category');
const ctrl = require('../controllers/formController');

// Helper function to validate category against database (kept in route validations)
const validateCategory = async (value) => {
  const category = await Category.findOne({ name: value, isActive: true });
  if (!category) {
    throw new Error(`Invalid category: ${value}. Please use an active category from the system.`);
  }
  return true;
};

// Get all forms
router.get('/', ctrl.getAll);

// Get form by ID
router.get('/:id', ctrl.getById);

// Remove inline helper implementations; controller contains the logic.

// Create new form
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('questions').isArray().withMessage('Questions must be an array'),
  body('questions.*.question').notEmpty().withMessage('Question is required'),
  body('questions.*.questionType').notEmpty().withMessage('Question type is required').custom(validateCategory),
  body('questions.*.questionId').notEmpty().withMessage('Question ID is required'),
  body('questions.*.option_type').isIn(['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file']).withMessage('Invalid option type')
], ctrl.create);

// Update form
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('questions').optional().isArray().withMessage('Questions must be an array')
], ctrl.update);

// Add question to existing form
router.post('/:id/questions', [
  body('question').notEmpty().withMessage('Question is required'),
  body('questionType').notEmpty().withMessage('Question type is required').custom(validateCategory),
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('option_type').isIn(['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file']).withMessage('Invalid option type')
], ctrl.addQuestion);

// Delete form
router.delete('/:id', ctrl.remove);

// Create sample form
router.post('/sample', ctrl.createSample);

module.exports = router;
