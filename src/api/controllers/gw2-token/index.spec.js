import proxyquire from 'proxyquire';

import * as testData from 'test/testData';
import Models from 'lib/models';

describe('gw2 token controller', () => {
  let controller;
  let models;
  let httpPost;
  let readTokenInfoWithAccount;
  let validate;
  let createValidator;

  const mockConfig = {
    fetch: {
      host: 'host',
      port: 'port',
    },
  };

  beforeEach(async () => {
    models = await setupTestDb();

    httpPost = sinon.stub();
    readTokenInfoWithAccount = sinon.stub();
    validate = sinon.stub();
    createValidator = () => ({ validate });
    createValidator.addResource = sinon.spy();

    const { default: controllerFactory } = proxyquire('./', {
      axios: {
        post: httpPost,
      },
      config: mockConfig,
    });

    controller = controllerFactory(models, createValidator, {
      readTokenInfoWithAccount,
    });
  });

  const seedDb = async function (email, addTokens = true) {
    const user = await models.User.create(testData.user({ email }));

    if (addTokens) {
      await models.Gw2ApiToken.create(testData.apiToken({
        id: user.id,
        token: 'cool_token',
        primary: true,
      }));

      await models.Gw2ApiToken.create(testData.apiToken({
        id: user.id,
        token: 'another_token',
        accountName: 'asdasd',
        accountId: 'azcxxc',
      }));
    }

    return user.id;
  };

  describe('list', () => {
    it('should list tokens in db', async () => {
      await seedDb('email@email.com');

      const tokens = await controller.list('email@email.com');

      expect(2).to.equal(tokens.length);

      const [token1, token2] = tokens;

      expect('cool_token').to.equal(token1.token);
      expect('cool.4321').to.equal(token1.accountName);
      expect(1234).to.equal(token1.world);
      expect(true).to.equal(token1.primary);

      expect('another_token').to.equal(token2.token);
      expect('asdasd').to.equal(token2.accountName);
      expect(1234).to.equal(token2.world);
      expect(false).to.equal(token2.primary);
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

    it('should return true if user has tokens', async () => {
      const id = await seedDb('email@email.com');
      const result = await controller.doesUserHaveTokens(id);

      expect(result).to.equal(true);
    });

    it('should return false if user has no tokens', async () => {
      const id = await seedDb('email@stuff.com', false);

      const result = await controller.doesUserHaveTokens(id);

      expect(result).to.equal(false);
    });

    it('should add token to db as not primary', async () => {
      validate.returns(Promise.resolve());

      readTokenInfoWithAccount.returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));

      httpPost.returns(Promise.resolve());

      await seedDb('cool@email.com');

      const result = await controller.add('cool@email.com', 'token');

      expect(result.primary).to.equal(false);
    });

    it('should add token to db as primary if first token', async () => {
      validate.returns(Promise.resolve());

      readTokenInfoWithAccount.returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));


      await models.User.create({
        email: 'cool@email.com',
        passwordHash: 'lolz',
        alias: 'swagn',
      });

      const result = await controller.add('cool@email.com', 'token');

      expect(result).to.eql({
        token: 'token',
        primary: true,
        permissions: 'cool,yeah!',
        accountName: 'nameee',
        world: 1122,
      });

      expect(httpPost).to.have.been.calledWith('http://host:port/fetch', {
        token: 'token',
        permissions: 'cool,yeah!',
      });
    });
  });

  describe('select primary', () => {
    it('should set all tokens primary to false except for target', async () => {
      await seedDb('email@email.com');

      const data = await controller.selectPrimary('email@email.com', 'another_token');

      const tokens = await models.Gw2ApiToken.findAll();
      const primaryToken = tokens.filter(({ token }) => token === 'another_token')[0];

      const otherTokens = tokens.filter(({ token }) => token !== 'another_token');

      expect(primaryToken.primary).to.equal(true);

      otherTokens.forEach((token) => expect(token.primary).to.equal(false));
    });
  });

  describe('removing', () => {
    it('should remove token from db', async () => {
      validate.returns(Promise.resolve());
      readTokenInfoWithAccount.returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));

      httpPost.returns(Promise.resolve());

      await models.User.create({
        email: 'cool@email.com',
        passwordHash: 'lolz',
        alias: 'swagn',
      });


      const result = await controller.add('cool@email.com', 'token');

      expect(result.token).to.equal('token');
      expect(result.accountName).to.equal('nameee');

      await controller.remove('cool@email.com', 'token');

      const tokens = await models.Gw2ApiToken.findOne({
        where: {
          token: 'token',
        },
      });

      expect(tokens).to.equal(null);
    });
  });
});
