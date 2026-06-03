const { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');
const { getProductById } = require('./product.dynamo.service');

const { getTableName } = require('../config/env');

function normalizeCartItem(item) {
  if (!item) return null;
  return {
    id: item.productId,
    cartItemId: item.productId,
    product_id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    name: item.productName,
    price: item.price,
    stock: item.stock,
    image_url: item.image_url,
    subtotal: Number(item.quantity) * Number(item.price),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function getCartItems(userId) {
  const result = await docClient.send(new QueryCommand({
    TableName: getTableName(),
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'CART#',
    },
  }));

  return (result.Items || []).map(normalizeCartItem);
}

async function getCartItem(userId, productId) {
  const result = await docClient.send(new GetCommand({
    TableName: getTableName(),
    Key: {
      PK: `USER#${userId}`,
      SK: `CART#${productId}`,
    },
  }));

  return result.Item || null;
}

async function addCartItem(userId, productId, quantity = 1) {
  const product = await getProductById(productId);
  if (!product || product.is_active === 0) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (Number(product.stock) < Number(quantity)) {
    const err = new Error('Not enough stock');
    err.statusCode = 400;
    throw err;
  }

  const existing = await getCartItem(userId, productId);
  const now = new Date().toISOString();

  if (existing) {
    const newQuantity = Number(existing.quantity) + Number(quantity);
    if (Number(product.stock) < newQuantity) {
      const err = new Error('Not enough stock');
      err.statusCode = 400;
      throw err;
    }

    await docClient.send(new UpdateCommand({
      TableName: getTableName(),
      Key: {
        PK: `USER#${userId}`,
        SK: `CART#${productId}`,
      },
      UpdateExpression: 'SET quantity = :quantity, stock = :stock, price = :price, productName = :productName, image_url = :imageUrl, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':quantity': newQuantity,
        ':stock': Number(product.stock),
        ':price': Number(product.price),
        ':productName': product.name,
        ':imageUrl': product.image_url || '',
        ':updatedAt': now,
      },
    }));
    return;
  }

  const item = {
    PK: `USER#${userId}`,
    SK: `CART#${productId}`,
    entityType: 'CART_ITEM',
    userId,
    productId,
    quantity: Number(quantity),
    productName: product.name,
    price: Number(product.price),
    stock: Number(product.stock),
    image_url: product.image_url || '',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: getTableName(),
    Item: item,
  }));
}

async function updateCartItemQuantity(userId, productId, quantity) {
  const product = await getProductById(productId);
  if (!product || product.is_active === 0) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (Number(product.stock) < Number(quantity)) {
    const err = new Error('Not enough stock');
    err.statusCode = 400;
    throw err;
  }

  await docClient.send(new UpdateCommand({
    TableName: getTableName(),
    Key: {
      PK: `USER#${userId}`,
      SK: `CART#${productId}`,
    },
    UpdateExpression: 'SET quantity = :quantity, stock = :stock, price = :price, productName = :productName, image_url = :imageUrl, updatedAt = :updatedAt',
    ConditionExpression: 'attribute_exists(PK)',
    ExpressionAttributeValues: {
      ':quantity': Number(quantity),
      ':stock': Number(product.stock),
      ':price': Number(product.price),
      ':productName': product.name,
      ':imageUrl': product.image_url || '',
      ':updatedAt': new Date().toISOString(),
    },
  }));
}

async function removeCartItemByProduct(userId, productId) {
  await docClient.send(new DeleteCommand({
    TableName: getTableName(),
    Key: {
      PK: `USER#${userId}`,
      SK: `CART#${productId}`,
    },
  }));
}

async function clearCart(userId) {
  const items = await getCartItems(userId);
  await Promise.all(items.map((item) => removeCartItemByProduct(userId, item.productId)));
}

module.exports = {
  getCartItems,
  getCartItem,
  addCartItem,
  updateCartItemQuantity,
  removeCartItemByProduct,
  clearCart,
};
