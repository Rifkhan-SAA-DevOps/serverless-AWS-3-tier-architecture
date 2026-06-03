const { randomUUID } = require('crypto');
const { PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');
const { getCartItems, clearCart } = require('./cart.dynamo.service');
const { decrementProductStock } = require('./product.dynamo.service');

const { getTableName } = require('../config/env');

function normalizeOrder(item) {
  if (!item) return null;
  return {
    id: item.orderId,
    order_id: item.orderId,
    orderId: item.orderId,
    user_id: item.userId,
    userId: item.userId,
    total_amount: item.totalAmount,
    totalAmount: item.totalAmount,
    shipping_address: item.shipping_address,
    phone: item.phone,
    status: item.status,
    items: item.items || [],
    customer_name: item.customerName,
    customer_email: item.customerEmail,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function createOrderFromCart(user, { shipping_address, phone }) {
  const cart = await getCartItems(user.id || user.userId);
  if (!cart.length) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  for (const item of cart) {
    if (Number(item.stock) < Number(item.quantity)) {
      const err = new Error(`${item.name} does not have enough stock`);
      err.statusCode = 400;
      throw err;
    }
  }

  // DynamoDB does not use the same SQL transaction style here.
  // For this portfolio version, we decrement each product conditionally, then create the order.
  // Later this can be upgraded to TransactWriteItems for full atomic checkout.
  for (const item of cart) {
    await decrementProductStock(item.productId, item.quantity);
  }

  const now = new Date().toISOString();
  const orderId = randomUUID();
  const userId = user.id || user.userId;
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const orderItem = {
    PK: `ORDER#${orderId}`,
    SK: 'METADATA',
    GSI1PK: 'ORDERS',
    GSI1SK: now,
    GSI2PK: `USER#${userId}`,
    GSI2SK: now,
    entityType: 'ORDER',
    orderId,
    userId,
    customerName: user.name,
    customerEmail: user.email,
    totalAmount,
    shipping_address,
    phone,
    status: 'pending',
    items: cart.map((item) => ({
      product_id: item.productId,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })),
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: getTableName(),
    Item: orderItem,
    ConditionExpression: 'attribute_not_exists(PK)',
  }));

  await clearCart(userId);

  return normalizeOrder(orderItem);
}

async function listOrdersByUser(userId) {
  const result = await docClient.send(new QueryCommand({
    TableName: getTableName(),
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
    },
    ScanIndexForward: false,
  }));

  return (result.Items || [])
    .filter((item) => item.entityType === 'ORDER')
    .map(normalizeOrder);
}

async function listAllOrders() {
  const result = await docClient.send(new QueryCommand({
    TableName: getTableName(),
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': 'ORDERS',
    },
    ScanIndexForward: false,
  }));

  return (result.Items || []).map(normalizeOrder);
}

async function getOrderById(orderId) {
  const result = await docClient.send(new GetCommand({
    TableName: getTableName(),
    Key: {
      PK: `ORDER#${orderId}`,
      SK: 'METADATA',
    },
  }));
  return normalizeOrder(result.Item);
}

async function updateOrderStatusById(orderId, status) {
  const result = await docClient.send(new UpdateCommand({
    TableName: getTableName(),
    Key: {
      PK: `ORDER#${orderId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  }));

  return normalizeOrder(result.Attributes);
}

module.exports = {
  createOrderFromCart,
  listOrdersByUser,
  listAllOrders,
  getOrderById,
  updateOrderStatusById,
};
