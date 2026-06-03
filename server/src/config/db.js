// MySQL is not used in the serverless DynamoDB version.
// This file is kept only as a guard so old imports fail with a clear message.

function throwRemovedDbError() {
  throw new Error(
    'src/config/db.js was used, but MySQL has been removed from the serverless DynamoDB version. Replace pool.query() with DynamoDB services.'
  );
}

module.exports = {
  query: throwRemovedDbError,
  getConnection: throwRemovedDbError,
};
