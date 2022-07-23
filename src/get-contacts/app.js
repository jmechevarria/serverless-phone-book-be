const db = require('./db');
const manager = require('./manager');

const secretsPromise = manager.getSecret(process.env.DB_CREDENTIALS_ARN);
let credentials;

exports.lambdaHandler = async (event) => {
  console.log(`Event = ${JSON.stringify(event)}`);

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
    // find contacts
    const contacts = (
      await db.query('SELECT * FROM "contact" WHERE user_id=$1', [event.userId])
    )?.rows;

    console.log(`Found ${contacts.length} contacts for user id ${event.userId}`);

    return { contacts };
  } catch (error) {
    console.error('Signing user up', error);

    throw new Error('500');
  }
};
