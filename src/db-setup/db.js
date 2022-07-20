const { Pool } = require('pg');
const Pool2 = require('pg-pool');

let pool;

/**
 * Takes a PostgreSQL query string as argument, and returns the results of the query.
 *
 * @param {string} querystring
 * @returns {Promise<QueryFunction>}
 */
exports.query = async (querystring, params) => {
  if (!pool) throw new Error('No connection');
  console.log('got a pool');

  try {
    const client = await pool.connect();
    console.log('got a client');
    try {
      const res = await client.query(querystring, params);
      console.log('got a res');
      console.log(res);
    } catch (error) {
      console.error('While running command', error);

      throw error;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('creating client', e);
  }

  const a = `
      -- CreateTable
      CREATE TABLE "user" ( 
          "id" SERIAL NOT NULL, 
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, 
          "email" TEXT NOT NULL, 
          "password" TEXT NOT NULL, 
          "name" TEXT NOT NULL, 
          CONSTRAINT "user_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
      `;
};

exports.createPool = (credentials) => {
  console.log('in', credentials);
  pool = new Pool({
    host: process.env.DB_ENDPOINT_ADDRESS,
    user: credentials.username,
    password: credentials.password,
    port: process.env.DB_ENDPOINT_PORT,
    database: process.env.DB_NAME,
  });
};
