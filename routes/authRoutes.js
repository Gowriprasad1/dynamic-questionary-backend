const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

// Login route
router.post('/login', ctrl.login);

// Verify token route
router.get('/verify', authenticateToken, ctrl.verify);

// Get all users (protected route)
router.get('/users', authenticateToken, ctrl.getUsers);

// Add new user (protected route)
router.post('/users', authenticateToken, ctrl.createUser);

// Delete user (protected route)
router.delete('/users/:userId', authenticateToken, ctrl.deleteUser);

module.exports = router;
