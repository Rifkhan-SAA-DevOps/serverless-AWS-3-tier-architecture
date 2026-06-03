const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// DynamoDB uses UUID/string IDs, not MySQL integer IDs.
const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('category_id').notEmpty().withMessage('category_id is required'),
];

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, productValidation, validate, createProduct);
router.put('/:id', protect, adminOnly, productValidation, validate, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
