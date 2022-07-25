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

  // check if email is already registered
  const existingEmail = (
    await db.query('SELECT * FROM "user" WHERE email=$1', [event.email])
  )?.rows?.[0];

  // if yes, return error
  if (existingEmail) {
    throw new Error('409-Email already registered');
  }

  try {
    // insert new user with hashed password
    const user = (
      await db.query(
        'INSERT INTO "user" (email, password, name) VALUES ($1, $2, $3) RETURNING *',
        [event.email, bcrypt.hashSync(event.password, bcrypt.genSaltSync()), event.name],
      )
    )?.rows?.[0];

    const userId = user?.id;

    if (userId) {
      console.log(`Created user with id ${userId}`);

      // get JWT secret
      const jwtSecret = await manager.getSecret('JWT_SECRET');

      // generate Bearer token
      const token = jwt.sign({
        sub: userId,
        email: event.email,
      }, jwtSecret, {
        expiresIn: 1200,
      });

      return {
        token,
        user: {
          name: user.name,
        },
      };
    }

    throw new Error('500:Unexpected error: user not created');
  } catch (error) {
    console.error('Signing user up', error);

    throw error;
  }
};
