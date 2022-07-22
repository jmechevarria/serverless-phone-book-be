const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

const getCredentials = async () => (await secretManagerClient.send(
  new GetSecretValueCommand({ SecretId: process.env.DB_CREDENTIALS_ARN }),
)).SecretString;

const db = require('./db');

exports.lambdaHandler = async (event) => {
  const credentials = JSON.parse(await getCredentials());

  await db.createClient(credentials);

  try {
    const res = await db.query(event.query, event.params);
    console.log('res', res);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
