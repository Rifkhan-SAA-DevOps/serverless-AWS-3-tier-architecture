const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');
const { env } = require('./env');

let loaded = false;

const PARAMETER_ENV_MAP = {
  '/jwt/secret': 'JWT_SECRET',
  '/jwt/expires-in': 'JWT_EXPIRES_IN',
  '/cors/origin': 'CLIENT_URL',
  '/dynamodb/table-name': 'DYNAMODB_TABLE_NAME',
  '/aws/region': 'AWS_REGION',
};

function resolveEnvName(parameterName, prefix) {
  const suffix = parameterName.replace(prefix, '');

  if (PARAMETER_ENV_MAP[suffix]) {
    return PARAMETER_ENV_MAP[suffix];
  }

  return suffix
    .replace(/^\//, '')
    .replace(/[-/]/g, '_')
    .toUpperCase();
}

async function loadSsmParameters() {
  if (loaded) return;

  const prefix = process.env.SSM_PARAMETER_PREFIX || env.ssmParameterPrefix;

  // Local development can use .env only. In Lambda, set SSM_PARAMETER_PREFIX.
  if (!prefix) {
    loaded = true;
    return;
  }

  const client = new SSMClient({ region: process.env.AWS_REGION || env.awsRegion });
  let nextToken;

  do {
    const result = await client.send(
      new GetParametersByPathCommand({
        Path: prefix,
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      })
    );

    for (const parameter of result.Parameters || []) {
      const envName = resolveEnvName(parameter.Name, prefix);
      process.env[envName] = parameter.Value;
    }

    nextToken = result.NextToken;
  } while (nextToken);

  loaded = true;
}

module.exports = {
  loadSsmParameters,
};
