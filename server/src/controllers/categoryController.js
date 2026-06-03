const { success, error } = require('../utils/apiResponse');
const {
  listCategories,
  createCategoryItem,
  deleteCategoryById,
} = require('../services/category.dynamo.service');

const getCategories = async (req, res, next) => {
  try {
    const categories = await listCategories();
    return success(res, 'Categories fetched', categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return error(res, 'Category name is required', 400);

    const category = await createCategoryItem({ name });
    return success(res, 'Category created', category, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await deleteCategoryById(req.params.id);
    return success(res, 'Category deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };
