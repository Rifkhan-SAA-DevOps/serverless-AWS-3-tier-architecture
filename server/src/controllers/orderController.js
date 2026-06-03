const { success, error } = require('../utils/apiResponse');
const {
  createOrderFromCart,
  listOrdersByUser,
  listAllOrders,
  updateOrderStatusById,
} = require('../services/order.dynamo.service');

const createOrder = async (req, res) => {
  try {
    const { shipping_address, phone } = req.body;
    if (!shipping_address || !phone) {
      return error(res, 'shipping_address and phone are required', 400);
    }

    const order = await createOrderFromCart(req.user, { shipping_address, phone });
    return success(res, 'Order created successfully', {
      order_id: order.orderId,
      total: order.totalAmount,
      order,
    }, 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await listOrdersByUser(req.user.id || req.user.userId);
    return success(res, 'Orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await listAllOrders();
    return success(res, 'All orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return error(res, 'Invalid order status', 400);

    const order = await updateOrderStatusById(req.params.id, status);
    return success(res, 'Order status updated', order);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
