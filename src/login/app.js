const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const jwt = require('jsonwebtoken');
const db = require('./db');

const secretManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

const getJWTSecret = async () => (await secretManagerClient.send(
  new GetSecretValueCommand({ SecretId: 'JWT_SECRET' }),
)).SecretString;

exports.lambdaHandler = async (event) => {
  try {
    await db.createClient(credentials);

    // find user in db
    const userId = await db.query('SELECT id FROM "user" WHERE email=$1', event.email);

    // get JWT secret
    const jwtSecret = await getJWTSecret();

    // generate Bearer token
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
