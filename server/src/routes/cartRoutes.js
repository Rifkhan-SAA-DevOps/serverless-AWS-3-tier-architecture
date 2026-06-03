const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.get('/', getCart);

// DynamoDB product_id is a UUID/string, not a MySQL integer.
router.post(
  '/',
  [
    body('product_id').notEmpty().withMessage('product_id is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart,
);

// :id is product_id in the DynamoDB version.
router.put('/:id', [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')], validate, updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
