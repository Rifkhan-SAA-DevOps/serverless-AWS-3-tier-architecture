const express = require('express');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamodb');
const { success, error } = require('../utils/apiResponse');
const { getTableName } = require('../config/env');

const router = express.Router();

router.get('/db-test', async (req, res) => {
  try {
    const tableName = getTableName();

    const item = {
      PK: 'TEST#CONNECTION',
      SK: 'METADATA',
      entityType: 'TEST',
      message: 'DynamoDB connection successful',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    const result = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { PK: 'TEST#CONNECTION', SK: 'METADATA' },
    }));

    return success(res, 'DynamoDB test completed', result.Item);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
