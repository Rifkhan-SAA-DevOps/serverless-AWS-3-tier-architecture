const serverless = require('serverless-http');
const { loadSsmParameters } = require('./config/ssm');

let cachedHandler;

module.exports.handler = async (event, context) => {
  await loadSsmParameters();

  if (!cachedHandler) {
    const app = require('./app');
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};
