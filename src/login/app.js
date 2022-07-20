const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const jwt = require('jsonwebtoken');

const secretManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

exports.lambdaHandler = async (event) => {
  try {
    // find user in db
    const userId = 1;

    // generate Bearer token
    const jwtSecret = (await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: 'JWT_SECRET' }),
    )).SecretString;

    const token = jwt.sign({
      expiresIn: 600,
      email: event.email,
    }, jwtSecret);

    return {
      token, userId,
    };
  } catch (error) {
    console.error('Parsing basic auth token', error);

    throw error;
  }
};
