require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || '*',

  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  dynamodbTableName: process.env.DYNAMODB_TABLE_NAME || 'weightshop-serverless-prod',

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  ssmParameterPrefix: process.env.SSM_PARAMETER_PREFIX || '',
};

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function getTableName() {
  return requireEnv('DYNAMODB_TABLE_NAME', process.env.DYNAMODB_TABLE_NAME || env.dynamodbTableName);
}

function getJwtSecret() {
  return requireEnv('JWT_SECRET', process.env.JWT_SECRET || env.jwtSecret);
}

module.exports = {
  env,
  requireEnv,
  getTableName,
  getJwtSecret,
};
