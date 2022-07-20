const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

const getCredentials = async () => (await secretManagerClient.send(
  new GetSecretValueCommand({ SecretId: process.env.DB_CREDENTIALS_ARN }),
)).SecretString;

const db = require('./db');

exports.lambdaHandler = async (event) => {
  try {
    const credentials = await getCredentials();
    db.createPool(JSON.parse(credentials));

    await db.query(event.sql);
  } catch (error) {
    console.error('Running SQL command', error);

    throw error;
  }
};
