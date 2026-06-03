const express = require('express');
const { body } = require('express-validator');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, [body('name').notEmpty().withMessage('Category name is required')], validate, createCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
