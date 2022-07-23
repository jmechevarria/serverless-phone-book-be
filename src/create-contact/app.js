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
    // create contact
    const contact = (
      await db.query(
        'INSERT INTO "contact" (name, phone, user_id) VALUES ($1, $2, $3) RETURNING *;',
        [event.name, event.phone, event.userId],
      )
    )?.rows?.[0];

    if (contact?.id) {
      console.log(`Created contact with id ${contact.id}`);

      return { contact };
    }

    throw new Error();
  } catch (error) {
    console.error('Creating contact', error);

    throw new Error('500:Unexpected error: contact not created');
  }
};
