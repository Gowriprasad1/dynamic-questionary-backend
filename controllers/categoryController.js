const Category = require('../models/Category');
const { validationResult } = require('express-validator');

async function getActive(req, res) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

async function getAll(req, res) {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

async function getById(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
}

async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name: req.body.name,
      description: req.body.description || '',
      order: req.body.order || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
}

async function update(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.body.name) {
      const existingCategory = await Category.findOne({ 
        name: req.body.name,
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
}

async function remove(req, res) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}

async function initializeDefaults(req, res) {
  try {
    const defaultCategories = [
      { name: 'Health', description: 'Health-related questions', order: 1 },
      { name: 'Travel', description: 'Travel-related questions', order: 2 },
      { name: 'Occupation', description: 'Occupation-related questions', order: 3 },
      { name: 'Avocation', description: 'Avocation-related questions', order: 4 }
    ];

    const createdCategories = [];
    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        const category = new Category(cat);
        await category.save();
        createdCategories.push(category);
      }
    }

    res.json({ 
      message: 'Default categories initialized', 
      created: createdCategories.length,
      categories: createdCategories 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing categories', error: error.message });
  }
}

module.exports = {
  getActive,
  getAll,
  getById,
  create,
  update,
  remove,
  initializeDefaults,
};
