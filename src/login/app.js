const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.lambdaHandler = async (event) => {
  try {
    // find user in db
    const userId = 1;

    // generate Bearer token
    const jwtSecret = crypto.randomBytes(256).toString('base64');
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
