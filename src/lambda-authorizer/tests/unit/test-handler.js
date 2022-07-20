const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../../app');

describe('Tests app.js', () => {
  let threw;

  before(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
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

  });
});
