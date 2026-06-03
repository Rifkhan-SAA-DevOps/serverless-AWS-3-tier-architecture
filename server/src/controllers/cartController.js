const { success, error } = require('../utils/apiResponse');
const {
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItemByProduct,
} = require('../services/cart.dynamo.service');

const getCart = async (req, res, next) => {
  try {
    const rows = await getCartItems(req.user.id || req.user.userId);
    return success(res, 'Cart fetched', rows);
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return error(res, 'product_id is required', 400);

    await addCartItem(req.user.id || req.user.userId, product_id, quantity);
    return success(res, 'Product added to cart');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return error(res, 'Quantity must be at least 1', 400);

    // In the DynamoDB version, req.params.id is the product_id/cart item id.
    await updateCartItemQuantity(req.user.id || req.user.userId, req.params.id, quantity);
    return success(res, 'Cart item updated');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    // In the DynamoDB version, req.params.id is the product_id/cart item id.
    await removeCartItemByProduct(req.user.id || req.user.userId, req.params.id);
    return success(res, 'Cart item removed');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
