const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const rewire = require('rewire');

const dbResponses = require('../mocks/db_responses');

const app = rewire('../../app');

describe('Tests app.js', () => {
  let threw;
  let queryStub;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');

    sinon.stub(Client.prototype, 'connect');
    queryStub = sinon.stub(Client.prototype, 'query');
  });

  beforeEach(() => {
    // eslint-disable-next-line no-underscore-dangle
    app.__set__('secretsPromise', Promise.resolve(
      JSON.stringify({ username: 'db_username', password: 'db_password' }),
    ));

    queryStub.resolves(dbResponses.ok);
    threw = false;
  });

  afterEach(() => {
    sinon.reset();
  });

  after(() => {
    sinon.restore();
  });

  it('Throws 500 if there is a problem fetching secrets', async () => {
    // eslint-disable-next-line no-underscore-dangle
    app.__set__('secretsPromise', Promise.reject());

    try {
      await app.lambdaHandler({ name: 'name', phone: 'phone', addressLines: [] });
    } catch (error) {
      expect(console.error.callCount).eq(1);
      expect(console.error.getCall(0).args[0]).eq('Getting credentials');
      threw = true;
    }

    expect(threw).eq(true);
  });

  it('Returns contact if one is created', async () => {
    const result = await app.lambdaHandler({ name: 'name', phone: 'phone', addressLines: [] });
    expect(result).eql({
      contact: {
        id: dbResponses.ok.rows[0].id,
        address_lines: dbResponses.ok.rows[0].address_lines.split('|||'),
      },
    });
  });

  it('Throws error if no contact is created', async () => {
    queryStub.resolves(dbResponses.empty);

    try {
      await app.lambdaHandler({ name: 'name', phone: 'phone', addressLines: [] });
    } catch (error) {
      expect(console.error.callCount).eq(1);
      expect(error.message).eq('500');
      threw = true;
    }

    expect(threw).eq(true);
  });
});
