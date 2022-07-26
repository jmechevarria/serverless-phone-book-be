const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const rewire = require('rewire');

const dbResponses = require('../mocks/db_responses');

const app = rewire('../../app');

describe('Tests app.js', () => {
  let threw;
  let queryStub;
  const event = { id: 1, userId: 2 };

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

    queryStub.resolves(dbResponses.one);
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
      await app.lambdaHandler(event);
    } catch (error) {
      expect(console.error.callCount).eq(1);
      expect(console.error.getCall(0).args[0]).eq('Getting credentials');
      threw = true;
    }

    expect(threw).eq(true);
  });

  it('Logs deletion of contact(s) if successful', async () => {
    let result = await app.lambdaHandler(event);

    expect(console.log.getCall(1).args[0]).eq(`Found 1 contact(s) for user id ${event.userId}`);
    expect(result).eql(
      {
        contacts: dbResponses.one
          .rows.map((c) => ({ ...c, address_lines: c.address_lines.split('|||') })),
      },
    );

    const eventCopy = JSON.parse(JSON.stringify(event));
    delete eventCopy.id;
    queryStub.resolves(dbResponses.two);
    console.log.reset();

    result = await app.lambdaHandler(eventCopy);

    expect(console.log.getCall(1).args[0]).eq(`Found 2 contact(s) for user id ${event.userId}`);
    expect(result).eql(
      {
        contacts: dbResponses.two
          .rows.map((c) => ({ ...c, address_lines: c.address_lines?.split('|||') })),
      },
    );
  });

  it('Throws 404 error if no contact is found for deletion', async () => {
    queryStub.resolves(dbResponses.empty);

    try {
      await app.lambdaHandler(event);
    } catch (error) {
      expect(console.error.callCount).eq(1);
      expect(error.message).eq('404:Not Found');
      threw = true;
    }

    expect(threw).eq(true);
  });

  it('Throws 500 error if there is an unexpected error', async () => {
    queryStub.rejects();

    try {
      await app.lambdaHandler(event);
    } catch (error) {
      expect(console.error.getCall(1).args[0]).eq(`Getting contact(s) for user id ${event.userId}`);
      expect(error.message).eq('500');
      threw = true;
    }

    expect(threw).eq(true);
  });
});
