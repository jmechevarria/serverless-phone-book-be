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
    // find contacts
    const [singleContactQuery, params] = event.id ? [' AND id=$2 ', [event.userId, event.id]] : [' ', [event.userId]];
    const contacts = (
      await db.query(
        `SELECT * FROM contact WHERE user_id=$1${singleContactQuery}ORDER BY name LIMIT ${
          event.limit || 'ALL'
        } OFFSET ${
          event.offset || 0
        };`,
        params,
      )
    )?.rows
      ?.map((contact) => ({ ...contact, address_lines: contact.address_lines?.split('|||') }));

    if (!contacts?.length && event.id) throw new CustomError('404:Not Found');

    console.log(`Found ${contacts.length} contact(s) for user id ${event.userId}`);

    return { contacts };
  } catch (error) {
    console.error(`Getting contact(s) for user id ${event.userId}`, error);

    if (error instanceof CustomError) throw error;

    throw new Error('500');
  }
};
