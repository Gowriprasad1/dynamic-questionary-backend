const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

async function login(req, res) {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) return res.status(400).json({ message: 'UserId and password are required' });

    const user = await User.findOne({ userId: userId.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.userId, id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { userId: user.userId, createdAt: user.createdAt } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

function verify(req, res) {
  return res.json({ valid: true, user: { userId: req.user.userId } });
}

async function getUsers(req, res) {
  try {
    const users = await User.find({}, 'userId createdBy createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
}

async function createUser(req, res) {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) return res.status(400).json({ message: 'UserId and password are required' });

    const existingUser = await User.findOne({ userId: userId.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ userId: userId.toLowerCase(), password, createdBy: req.user.userId });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: { userId: newUser.userId, createdBy: newUser.createdBy, createdAt: newUser.createdAt } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    if (userId.toLowerCase() === req.user.userId.toLowerCase()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deletedUser = await User.findOneAndDelete({ userId: userId.toLowerCase() });
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}

module.exports = { login, verify, getUsers, createUser, deleteUser };
