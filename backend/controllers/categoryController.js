const Category = require('../models/Category');

// @desc  Get all categories
// @route GET /api/categories
const getCategories = async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
};

// @desc  Create a category (Admin)
// @route POST /api/categories
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, description });
    res.status(201).json(category);
};

// @desc  Delete a category (Admin)
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.deleteOne();
    res.json({ message: 'Category removed' });
};

module.exports = { getCategories, createCategory, deleteCategory };
