const { randomUUID } = require('crypto');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');

const { getTableName } = require('../config/env');

function normalizeCategory(item) {
  if (!item) return null;
  return {
    id: item.categoryId,
    categoryId: item.categoryId,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function listCategories() {
  const result = await docClient.send(new QueryCommand({
    TableName: getTableName(),
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': 'CATEGORIES',
    },
    ScanIndexForward: true,
  }));

  return (result.Items || []).map(normalizeCategory);
}

async function getCategoryById(categoryId) {
  const result = await docClient.send(new GetCommand({
    TableName: getTableName(),
    Key: {
      PK: `CATEGORY#${categoryId}`,
      SK: 'METADATA',
    },
  }));

  return normalizeCategory(result.Item);
}

async function createCategoryItem({ name }) {
  const categoryId = randomUUID();
  const now = new Date().toISOString();

  const item = {
    PK: `CATEGORY#${categoryId}`,
    SK: 'METADATA',
    GSI1PK: 'CATEGORIES',
    GSI1SK: name.toLowerCase(),
    entityType: 'CATEGORY',
    categoryId,
    name,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: getTableName(),
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)',
  }));

  return normalizeCategory(item);
}

async function deleteCategoryById(categoryId) {
  await docClient.send(new DeleteCommand({
    TableName: getTableName(),
    Key: {
      PK: `CATEGORY#${categoryId}`,
      SK: 'METADATA',
    },
  }));
}

module.exports = { listCategories, getCategoryById, createCategoryItem, deleteCategoryById };
