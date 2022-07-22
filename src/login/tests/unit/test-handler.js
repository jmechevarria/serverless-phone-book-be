const sinon = require('sinon');
const { expect } = require('chai');
const { Client } = require('pg');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

const app = require('../../app');

describe('Tests app.js', () => {
  // let sendStub;
  let secretsManagerStub;
  let threw;
  let connectStub;
  let queryStub;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    // sendStub = sinon.stub(DynamoDBDocumentClient.prototype, 'send');
    secretsManagerStub = sinon.stub(SecretsManagerClient.prototype, 'send').resolves({ SecretString: 'dummy' });
    connectStub = sinon.stub(Client.prototype, 'connect').resolves({});
    queryStub = sinon.stub(Client.prototype, 'query').resolves({ rows: [{ id: 1, password: '123' }] });
  });

  beforeEach(() => {
    // sendStub.resolves({ Item: undefined });
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
