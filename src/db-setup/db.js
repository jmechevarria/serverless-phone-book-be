const { Client } = require('pg');

let client;

/**
 * Takes a PostgreSQL query string as argument, and returns the results of the query.
 *
 * @param {string} querystring
 * @returns {Promise<QueryFunction>}
 */
exports.query = async (querystring, params) => {
  if (!client) throw new Error('No connection');

  try {
    const res = await client.query(querystring, params);

    return res;
  } catch (error) {
    console.error('While running command', error);

    throw error;
  } finally {
    await endClient();
  }
};

exports.createClient = async (credentials) => {
  const dbConfig = {
    host: process.env.DB_ENDPOINT_ADDRESS,
    user: credentials.username,
    password: credentials.password,
    port: process.env.DB_ENDPOINT_PORT,
    database: process.env.DB_NAME,
  };

  client = new Client(dbConfig);
  await client.connect();
};

async function endClient() {
  await client.end();
  console.log('client ended');
}
