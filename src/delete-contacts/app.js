const db = require('./db');
const manager = require('./manager');
const { CustomError } = require('./errors');

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
    // delete contacts
    const [singleContactQuery, params] = event.id ? [' AND id=$2 ', [event.userId, event.id]] : [' ', [event.userId]];
    const contacts = (
      await db.query(
        `DELETE FROM contact WHERE user_id=$1${singleContactQuery}RETURNING *;`,
        params,
      )
    )?.rows
      ?.map((contact) => ({ ...contact, address_lines: contact.address_lines?.split('|||') }));

    if (!contacts?.length && event.id) throw new CustomError('404:Not Found');

    console.log(`Deleted ${contacts.length} contact(s) for user id ${event.userId}`);
  } catch (error) {
    console.error(`Deleting contact(s) for user id ${event.userId}`, error);

    if (error instanceof CustomError) throw error;

    throw new Error('500');
  }
};
