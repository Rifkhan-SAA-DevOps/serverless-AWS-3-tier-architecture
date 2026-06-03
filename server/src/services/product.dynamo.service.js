const { randomUUID } = require('crypto');
const {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');
const { getCategoryById } = require('./category.dynamo.service');

const { getTableName } = require('../config/env');

function normalizeProduct(item) {
  if (!item) return null;
  return {
    id: item.productId,
    productId: item.productId,
    name: item.name,
    description: item.description,
    price: item.price,
    stock: item.stock,
    weight_kg: item.weight_kg,
    image_url: item.image_url,
    category_id: item.categoryId,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    is_active: item.isActive ? 1 : 0,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function listProducts({ category, search } = {}) {
  let result;

  if (category) {
    result = await docClient.send(new QueryCommand({
      TableName: getTableName(),
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :categoryPk',
      ExpressionAttributeValues: {
        ':categoryPk': `CATEGORY#${category}`,
      },
      ScanIndexForward: false,
    }));
  } else {
    result = await docClient.send(new QueryCommand({
      TableName: getTableName(),
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'PRODUCTS',
      },
      ScanIndexForward: false,
    }));
  }

  let products = (result.Items || []).filter((item) => item.isActive !== false);

  if (search) {
    const q = search.toLowerCase();
    products = products.filter((item) =>
      item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    );
  }

  return products.map(normalizeProduct);
}

async function getProductById(productId) {
  const result = await docClient.send(new GetCommand({
    TableName: getTableName(),
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
  }));
  return normalizeProduct(result.Item);
}

async function createProductItem(payload) {
  const productId = randomUUID();
  const now = new Date().toISOString();
  const category = payload.category_id ? await getCategoryById(payload.category_id) : null;

  const item = {
    PK: `PRODUCT#${productId}`,
    SK: 'METADATA',
    GSI1PK: 'PRODUCTS',
    GSI1SK: now,
    GSI2PK: payload.category_id ? `CATEGORY#${payload.category_id}` : 'CATEGORY#UNCATEGORIZED',
    GSI2SK: now,
    entityType: 'PRODUCT',
    productId,
    name: payload.name,
    description: payload.description || '',
    price: Number(payload.price),
    stock: Number(payload.stock || 0),
    weight_kg: payload.weight_kg ? Number(payload.weight_kg) : null,
    image_url: payload.image_url || '',
    categoryId: payload.category_id || null,
    categoryName: category?.name || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: getTableName(),
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  }));

  return normalizeProduct(item);
}

async function updateProductItem(productId, payload) {
  const existing = await getProductById(productId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const categoryId = payload.category_id ?? existing.categoryId ?? existing.category_id;
  const category = categoryId ? await getCategoryById(categoryId) : null;

  const result = await docClient.send(new UpdateCommand({
    TableName: getTableName(),
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
    UpdateExpression: `SET #name = :name, description = :description, price = :price, stock = :stock,
      weight_kg = :weightKg, image_url = :imageUrl, categoryId = :categoryId, categoryName = :categoryName,
      isActive = :isActive, GSI2PK = :gsi2pk, updatedAt = :updatedAt`,
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': payload.name,
      ':description': payload.description || '',
      ':price': Number(payload.price),
      ':stock': Number(payload.stock || 0),
      ':weightKg': payload.weight_kg ? Number(payload.weight_kg) : null,
      ':imageUrl': payload.image_url || '',
      ':categoryId': categoryId || null,
      ':categoryName': category?.name || null,
      ':isActive': payload.is_active === undefined ? true : Boolean(Number(payload.is_active)),
      ':gsi2pk': categoryId ? `CATEGORY#${categoryId}` : 'CATEGORY#UNCATEGORIZED',
      ':updatedAt': now,
    },
    ReturnValues: 'ALL_NEW',
  }));

  return normalizeProduct(result.Attributes);
}

async function softDeleteProduct(productId) {
  await docClient.send(new UpdateCommand({
    TableName: getTableName(),
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET isActive = :inactive, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':inactive': false,
      ':updatedAt': new Date().toISOString(),
    },
  }));
}

async function decrementProductStock(productId, quantity) {
  const result = await docClient.send(new UpdateCommand({
    TableName: getTableName(),
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET stock = stock - :qty, updatedAt = :updatedAt',
    ConditionExpression: 'stock >= :qty AND isActive = :active',
    ExpressionAttributeValues: {
      ':qty': Number(quantity),
      ':active': true,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  }));
  return normalizeProduct(result.Attributes);
}

module.exports = {
  listProducts,
  getProductById,
  createProductItem,
  updateProductItem,
  softDeleteProduct,
  decrementProductStock,
};
