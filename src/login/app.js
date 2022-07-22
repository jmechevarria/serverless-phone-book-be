const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
const manager = require('./manager');

exports.lambdaHandler = async (event) => {
  try {
    const credentials = JSON.parse(await manager.getSecret(process.env.DB_CREDENTIALS_ARN));
    await db.createClient(credentials);

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

    return {
      token, userId,
    };
  } catch (error) {
    console.error('Parsing basic auth token', error);

    throw error;
  }
};
