require('dotenv').config();
const app = require('./app');
const { env } = require('./config/env');

app.listen(env.port, () => {
  console.log(`🚀 WeightShop API running locally on port ${env.port}`);
});
