const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const rewire = require('rewire');

const dbResponses = require('../mocks/db_responses');

const db = rewire('../../db');

describe('Tests db.js', () => {
  let threw;
  let queryStub;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');

    sinon.stub(Client.prototype, 'connect');
    queryStub = sinon.stub(Client.prototype, 'query');
  });

  beforeEach(() => {
    queryStub.resolves(dbResponses.ok);
    threw = false;
  });

  afterEach(() => {
    sinon.reset();
  });

  after(() => {
    sinon.restore();
  });

  it('Throws error if no db client is available to query', async () => {
    // eslint-disable-next-line no-underscore-dangle
    const revertWire = db.__set__('connectClient', () => undefined);
    // eslint-disable-next-line no-underscore-dangle
    const revertWire2 = db.__set__('credentials', { username: 'db_username', password: 'db_password' });

    try {
      await db.query('query', []);
    } catch (error) {
      expect(error.message).eq('No connection');
      threw = true;
    }

    expect(threw).eq(true);
    revertWire();
    revertWire2();
  });

  it('Throws error if client.query throws error', async () => {
    // eslint-disable-next-line no-underscore-dangle
    const revertWire = db.__set__('credentials', { username: 'db_username', password: 'db_password' });
    queryStub.rejects();

    try {
      await db.query('query', []);
    } catch (error) {
      expect(console.error.callCount).eq(1);
      expect(error.message).eq('Error');
      threw = true;
    }

    expect(threw).eq(true);
    revertWire();
  });
});
