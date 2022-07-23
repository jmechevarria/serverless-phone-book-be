const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
const manager = require('./manager');

const secretsPromise = manager.getSecret(process.env.DB_CREDENTIALS_ARN);
let credentials;

exports.lambdaHandler = async (event) => {
  if (!credentials) {
    try {
      credentials = JSON.parse(await secretsPromise);
      db.setCredentials(credentials);
    } catch (error) {
      console.error('Getting credentials', error);

      throw new Error('500');
    }
  }

  try {
    // find user in db
    const result = (await db.query('SELECT * FROM "user" WHERE email=$1', [event.email])).rows?.[0];
    const userId = result?.id;

    if (!userId || !bcrypt.compareSync(event.password, result?.password)) throw new Error('401 - Unauthorized');

    // get JWT secret
    const jwtSecret = await manager.getSecret('JWT_SECRET');

    // generate Bearer token
    const token = jwt.sign({
      sub: userId,
      email: event.email,
    }, jwtSecret, {
      expiresIn: 600,
    });

    console.log(`Logged in user with id ${userId}`);

    return { token, userId };
  } catch (error) {
    console.error('Logging user in', error);

    throw error;
  }
};
