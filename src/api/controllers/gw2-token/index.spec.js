import proxyquire from 'proxyquire';
import * as testData from 'test/testData/db';

const models = {};

const sandbox = sinon.sandbox.create();
const createToken = sandbox.stub();
const replaceToken = sandbox.stub();
const claimStubApiToken = sandbox.stub();
const doesUserHaveTokens = sandbox.stub();
const getUserId = sandbox.stub();
const selectPrimaryToken = sandbox.stub();
const removeToken = sandbox.stub();
const doesTokenExist = sandbox.stub();
const listTokens = sandbox.stub();
const fetchUserData = sandbox.spy();
const readTokenInfoWithAccount = sandbox.stub();

const validate = sandbox.stub();
const createValidator = () => ({ validate });
createValidator.addResource = sandbox.spy();

const controllerFactory = proxyquire('./', {
  'lib/services/fetch': { fetch: fetchUserData },
  'lib/gw2': {
    default: { readTokenInfoWithAccount },
  },
  'lib/services/tokens': {
    replace: replaceToken,
    create: createToken,
  },
  'lib/services/user': {
    claimStubApiToken,
    doesUserHaveTokens,
    getUserId,
    selectPrimaryToken,
    removeToken,
    doesTokenExist,
    listTokens,
  },
}).default;

describe('gw2 token controller', () => {
  let controller;

  const apiToken = testData.apiToken({
    token: 'cool_token',
    primary: true,
  });
  const apiTokenTwo = testData.apiToken({
    id: 2,
    token: 'another_token',
    accountName: 'asdasd.4444',
    accountId: 'azcxxc',
  });

  beforeEach(async () => {
    controller = controllerFactory(models, createValidator);
  });

  afterEach(() => sandbox.reset());

  describe('list', () => {
    it('should list tokens in db', async () => {
      const email = 'email@email.com';
      listTokens.withArgs(models, email).returns([
        apiToken,
        apiTokenTwo,
      ]);

      const tokens = await controller.list(email);

      expect(2).to.equal(tokens.length);
      const [token1, token2] = tokens;
      expect(apiToken.token).to.equal(token1.token);
      expect(apiToken.accountName).to.equal(token1.accountName);
      expect(apiToken.world).to.equal(token1.world);
      expect(apiToken.primary).to.equal(token1.primary);
      expect(apiTokenTwo.token).to.equal(token2.token);
      expect(apiTokenTwo.accountName).to.equal(token2.accountName);
      expect(apiTokenTwo.world).to.equal(token2.world);
      expect(apiTokenTwo.primary).to.equal(token2.primary);
    });
  });

  describe('adding', () => {
    it('should add users resource in update-gw2-token mode to validator', () => {
      expect(createValidator.addResource).to.have.been.calledWith({
        name: 'gw2-token',
        mode: 'add',
        rules: {
          token: ['valid-gw2-token', 'no-white-space'],
        },
      });
    });

    it('should reject promise if validation fails', async () => {
      validate.returns(Promise.reject('failed'));

      try {
        await controller.add('1234', 'token');
      } catch (e) {
        expect(e).to.equal('failed');
        expect(validate).to.have.been.calledWith({
          token: 'token',
        });
      }
    });

    it('should add token to db as not primary', async () => {
      validate.returns(Promise.resolve());
      createToken.returns(apiToken);
      doesUserHaveTokens.returns(Promise.resolve(true));
      readTokenInfoWithAccount.returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));

      await controller.add('cool@email.com', 'token');

      expect(createToken.firstCall.args[1]).to.include({
        makePrimary: false,
      });
    });

    it('should add token to db as primary if first token', async () => {
      const info = ['cool', 'yeah!'];
      validate.returns(Promise.resolve());
      createToken.returns(apiToken);
      doesUserHaveTokens.returns(Promise.resolve(false));
      readTokenInfoWithAccount.returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info,
      }));

      const result = await controller.add('cool@email.com', 'token');

      expect(createToken.firstCall.args[1]).to.include({
        makePrimary: true,
        apiToken: 'token',
        permissions: info,
        accountName: 'nameee',
      });

      expect(fetchUserData).to.have.been.calledWith({
        token: result.token,
        permissions: result.permissions,
        id: result.id,
      });
    });
  });

  describe('removing', () => {
    it('should remove token from db', async () => {
      const email = 'email@email.email';
      const token = '1234';

      await controller.remove(email, token);

      expect(removeToken).to.have.been.calledWith(models, email, token);
    });
  });
});
