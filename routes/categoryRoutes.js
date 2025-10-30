const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/categoryController');

// Get all active categories
router.get('/', ctrl.getActive);

// Get all categories (including inactive)
router.get('/all', ctrl.getAll);

// Get category by ID
router.get('/:id', ctrl.getById);

// Create new category
router.post('/', [
  body('name').notEmpty().withMessage('Category name is required').trim(),
  body('description').optional().trim(),
  body('order').optional().isInt().withMessage('Order must be a number')
], ctrl.create);

// Update category
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty').trim(),
  body('description').optional().trim(),
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], ctrl.update);

// Delete category
router.delete('/:id', ctrl.remove);

// Initialize default categories (can be called once to seed the database)
router.post('/initialize-defaults', ctrl.initializeDefaults);

module.exports = router;
