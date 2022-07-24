const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

sinon.stub(SecretsManagerClient.prototype, 'send').resolves({
  SecretString: JSON.stringify({ username: 'db_username', password: 'db_password' }),
});

const app = require('../../app');

describe('Tests app.js', () => {
  let threw;
  let connectStub;
  let queryStub;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    connectStub = sinon.stub(Client.prototype, 'connect');
    queryStub = sinon.stub(Client.prototype, 'query').resolves({
      rows: [{
        id: 1,
      }],
    });
  });

  beforeEach(() => {
    threw = false;
  });

  afterEach(() => {
    sinon.reset();
  });

  after(() => {
    sinon.restore();
  });

  it('OK', async () => {
    const result = await app.lambdaHandler({
      id: 1, userId: 1, name: 'name', phone: 'phone', addressLines: [],
    });
    console.warn(result);
  });
});
