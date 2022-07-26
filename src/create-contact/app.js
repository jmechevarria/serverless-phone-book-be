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
    // create contact
    const contact = (
      await db.query(
        'INSERT INTO contact (name, phone, user_id, address_lines) VALUES ($1, $2, $3, $4) RETURNING *;',
        [event.name, event.phone, event.userId, event.addressLines?.join('|||')],
      )
    )?.rows?.map((c) => ({ ...c, address_lines: c.address_lines?.split('|||') }))?.[0];

    if (contact?.id) {
      console.log(`Created contact with id ${contact.id}`);

      return { contact };
    }

    throw new Error();
  } catch (error) {
    console.error('Creating contact', error);

    throw new Error('500');
  }
};
