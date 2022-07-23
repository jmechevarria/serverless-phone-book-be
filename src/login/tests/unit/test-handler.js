const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
const bcrypt = require('bcrypt');

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
        password: bcrypt.hashSync('123', bcrypt.genSaltSync()),
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
    const result = await app.lambdaHandler({ username: 'username', password: '123' });
    console.warn(result);
  });
});
