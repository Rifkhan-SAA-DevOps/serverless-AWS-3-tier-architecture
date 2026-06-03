const { success, error } = require('../utils/apiResponse');
const {
  listProducts,
  getProductById: findProductById,
  createProductItem,
  updateProductItem,
  softDeleteProduct,
} = require('../services/product.dynamo.service');

const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const products = await listProducts({ category, search });
    return success(res, 'Products fetched', products);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product || product.is_active === 0) return error(res, 'Product not found', 404);
    return success(res, 'Product fetched', product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    if (!name || price === undefined || stock === undefined || !category_id) {
      return error(res, 'Name, price, stock, and category_id are required', 400);
    }

    const product = await createProductItem(req.body);
    return success(res, 'Product created', { id: product.id, product }, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await updateProductItem(req.params.id, req.body);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, 'Product updated', product);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await softDeleteProduct(req.params.id);
    return success(res, 'Product deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
