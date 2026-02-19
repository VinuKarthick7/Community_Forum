const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middlewares/auth');

router.get('/', getCategories);
router.post('/', protect, isAdmin, createCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;
