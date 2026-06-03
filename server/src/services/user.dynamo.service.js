const { randomUUID } = require('crypto');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');

const { getTableName } = require('../config/env');

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.userId,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  const result = await docClient.send(new QueryCommand({
    TableName: getTableName(),
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :email',
    ExpressionAttributeValues: {
      ':email': `EMAIL#${normalizedEmail}`,
    },
    Limit: 1,
  }));
  return result.Items?.[0] || null;
}

async function findUserById(userId) {
  const result = await docClient.send(new GetCommand({
    TableName: getTableName(),
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
  }));
  return result.Item || null;
}

async function createUser({ name, email, passwordHash, role = 'customer' }) {
  const normalizedEmail = email.toLowerCase();
  const userId = randomUUID();
  const now = new Date().toISOString();

  const item = {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
    GSI1PK: `EMAIL#${normalizedEmail}`,
    GSI1SK: `USER#${userId}`,
    entityType: 'USER',
    userId,
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: getTableName(),
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  }));

  return item;
}

module.exports = { createUser, findUserByEmail, findUserById, sanitizeUser };
