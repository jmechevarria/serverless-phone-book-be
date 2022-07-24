const utils = require('./utils');
const db = require('./db');
const manager = require('./manager');
const { CustomError } = require('./errors');

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
    const { querystring, params } = utils.buildQuery(event);

    // update contact
    const contact = (
      await db.query(querystring, params)
    )?.rows?.map((c) => ({ ...c, address_lines: c.address_lines?.split('|||') }))?.[0];

    if (!contact?.id) throw new CustomError('404:Not Found');

    console.log(`Updated contact with id ${contact.id}`);

    return { contact };
  } catch (error) {
    console.error(`Updating contact(s) for user id ${event.userId}`, error);

    if (error instanceof CustomError) throw error;

    throw new Error('500');
  }
};
