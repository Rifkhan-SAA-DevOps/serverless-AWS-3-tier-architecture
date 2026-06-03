const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  [body('shipping_address').notEmpty().withMessage('shipping_address is required'), body('phone').notEmpty().withMessage('phone is required')],
  validate,
  createOrder,
);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, [body('status').notEmpty().withMessage('status is required')], validate, updateOrderStatus);

module.exports = router;
