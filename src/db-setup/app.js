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
    const res = await db.query(event.query, event.params);
    console.log('res', res);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
