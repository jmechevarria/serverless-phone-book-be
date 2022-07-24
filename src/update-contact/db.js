const { Client } = require('pg');

let credentials;

/**
 * Takes a PostgreSQL query string as argument, and returns the results of the query.
 *
 * @param {string} querystring
 * @returns {Promise<QueryFunction>}
 */
exports.query = async (querystring, params) => {
  const client = await connectClient();

  if (!client) throw new Error('No connection');

  try {
    return await client.query(querystring, params);
  } catch (error) {
    console.error(`While running query ${querystring} with params`, params, error);

    throw error;
  } finally {
    await endClient(client);
  }
};

const connectClient = async () => {
  const client = new Client({
    host: process.env.DB_ENDPOINT_ADDRESS,
    user: credentials.username,
    password: credentials.password,
    port: process.env.DB_ENDPOINT_PORT,
    database: process.env.DB_NAME,
  });

  await client.connect();

  return client;
};

exports.setCredentials = (creds) => {
  credentials = creds;
};

async function endClient(client) {
  await client.end();
  console.log('client ended');
}
