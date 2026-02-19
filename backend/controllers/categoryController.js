const Category = require('../models/Category');

// @desc  Get all categories
// @route GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// @desc  Create a category (Admin)
// @route POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (exists) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// @desc  Delete a category (Admin)
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

module.exports = { getCategories, createCategory, deleteCategory };
