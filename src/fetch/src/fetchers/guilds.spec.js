const proxyquire = require('proxyquire');
const testData = require('../../test/testData');

const sandbox = sinon.sandbox.create();
const account = sandbox.stub();
const guildAuthenticated = sandbox.stub();

const fetcher = proxyquire('./guilds', {
  '../lib/gw2': {
    account,
    guildAuthenticated,
  },
});

describe('guild fetcher', () => {
  const token = { token: '1234-12341234-1234', permissions: 'guilds,account' };
  const authGuildData = {
    level: 69,
    motd: 'Cool message',
    influence: 23,
    aetherium: 233,
    resonance: 44,
    favor: 11,
  };

  const accountInfoData = {
    guildLeader: [
      '1234',
    ],
  };

  let models;

  const findGuild = () => {
    return models.Gw2Guild.findOne({
      where: {
        id: accountInfoData.guildLeader[0],
      },
    });
  };

  before(() => {
    return setupDb({ seedDb: true, token: token.token })
      .then((mdls) => {
        models = mdls;
        return models.Gw2Guild.create(testData.guild(accountInfoData.guildLeader[0]));
      });
  });

  context('when token has permissions and is guild leader', () => {
    before(() => {
      account.withArgs(token.token).returns(Promise.resolve(accountInfoData));
      guildAuthenticated.withArgs(token.token, accountInfoData.guildLeader[0])
        .returns(Promise.resolve(authGuildData));

      return fetcher(models, token);
    });

    it('should check if token is a guild leader', () => {
      expect(account).to.have.been.calledWith(token.token);
    });

    it('should associate guilds that token is a leader of', () => {
      return findGuild()
        .then((guild) => expect(guild.apiToken).to.equal(token.token));
    });

    it('should add authenticated data into guild using token', () => {
      return findGuild()
        .then((guild) => expect(guild).to.include(authGuildData));
    });

    it('should not remove guild if token is removed', () => {
      return models.Gw2ApiToken.destroy({
        where: {
          token: token.token,
        },
      })
      .then(findGuild)
      .then((guild) => expect(guild).to.exist);
    });
  });

  context('when token has no permissions', () => {
    it('should gracefully bail out', () => {
      const tokenB = { token: '1234-4321', permissions: '' };

      return fetcher(models, tokenB);
    });
  });

  context('when token has permissions but is not a guild leader', () => {
    it('should gracefully bail out', () => {
      const tokenC = { token: '1234-4321-111' };

      account.withArgs(tokenC.token).returns(Promise.resolve({}));

      return fetcher(models, tokenC);
    });
  });
});
