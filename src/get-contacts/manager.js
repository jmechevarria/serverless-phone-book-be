const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

exports.getSecret = async (SecretId) => (await secretManagerClient.send(
  new GetSecretValueCommand({ SecretId }),
)).SecretString;
