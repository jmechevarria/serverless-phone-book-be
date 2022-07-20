const sinon = require('sinon');
const { expect } = require('chai');
// const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
const { Pool } = require('pg');

const app = require('../../app');

describe('Tests app.js', () => {
  // let sendStub;
  let secretsManagerStub;
  let poolStub;
  let threw;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    // sendStub = sinon.stub(DynamoDBDocumentClient.prototype, 'send');
    secretsManagerStub = sinon.stub(SecretsManagerClient.prototype, 'send').resolves(
      { SecretString: JSON.stringify({ password: 'password', username: 'username' }) },
    );

    poolStub = sinon.stub(Pool.prototype, 'connect').resolves(({ query: () => {}, release: () => {} }));
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