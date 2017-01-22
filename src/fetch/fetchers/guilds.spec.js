import _ from 'lodash';
import * as testData from 'test/testData';

const sandbox = sinon.sandbox.create();
const account = sandbox.stub();
const readGuild = sandbox.stub();

const fetcher = proxyquire('fetch/fetchers/guilds', {
  'lib/gw2': {
    readAccount: account,
    readGuild,
  },
});

describe('guild fetcher', () => {
  const token = testData.apiToken({
    permissions: 'guilds',
  });

  const guilds = [
    testData.guild({ id: '1', apiToken: token.id }),
    testData.guild({ id: '2', apiToken: token.id }),
    testData.guild({ id: '3', apiToken: token.id }),
    testData.guild({ id: '4', apiToken: token.id }),
  ];

  const accountInfoData = {
    guildLeader: guilds.map(({ id }) => id),
  };

  let models;

  const findGuilds = () => {
    return models.Gw2Guild.findAll();
  };

  before(async () => {
    models = await setupTestDb({ seed: true, apiToken: token.id });

    const promises = guilds.map((guild) => {
      return models.Gw2Guild.create(_.pick(guild, [
        'id',
        'tag',
        'name',
      ]));
    });

    await promises;
  });

  context('when token has permissions and is guild leader', () => {
    before(async () => {
      account
        .withArgs(token.token)
        .returns(Promise.resolve(accountInfoData));

      guilds.forEach((guild) => {
        readGuild
          .withArgs(token.token, guild.id)
          .returns(Promise.resolve(guild));
      });

      await fetcher(models, token);
    });

    it('should check if token is a guild leader', () => {
      expect(account).to.have.been.calledWith(token.token);
    });

    it('should associate guilds that token is a leader of', async () => {
      const guildz = await findGuilds();

      guildz.forEach((guild) => expect(guild.apiToken).to.equal(token.id));
    });

    it('should add authenticated data into guild using token', async () => {
      const guildz = await findGuilds();

      guildz.forEach((guild, index) => {
        const { claimed, ...expected } = guilds[index];
        expect(guild).to.include(expected);
      });
    });

    it('should not remove guild if token is removed', async () => {
      await models.Gw2ApiToken.destroy({
        where: {
          token: token.token,
        },
      });

      const guildz = await findGuilds();

      expect(guildz.length).to.equal(guilds.length);
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
