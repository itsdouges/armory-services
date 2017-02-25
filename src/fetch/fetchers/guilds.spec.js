import _ from 'lodash';
import * as testData from 'test/testData/db';

const sandbox = sinon.sandbox.create();
const account = sandbox.stub();
const readGuild = sandbox.stub();
const readGuildMembers = sandbox.stub();
const bulkCreateStubUser = sandbox.spy();

const fetcher = proxyquire('fetch/fetchers/guilds', {
  'lib/gw2': {
    readAccount: account,
    readGuild,
    readGuildMembers,
  },
  'lib/services/user': {
    bulkCreateStubUser,
  },
});

describe('guild fetcher', () => {
  const token = testData.apiToken({
    permissions: 'guilds',
  });

  const guilds = [
    testData.guild({ id: '1', apiTokenId: token.id }),
    testData.guild({ id: '2', apiTokenId: token.id }),
    testData.guild({ id: '3', apiTokenId: token.id }),
    testData.guild({ id: '4', apiTokenId: token.id }),
  ];

  const accountInfoData = {
    guildLeader: guilds.map(({ id }) => id),
  };

  let models;

  const findGuilds = () => {
    return models.Gw2Guild.findAll();
  };

  before(async () => {
    models = await setupTestDb({ seed: true });

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
    const member = (name) => ({ name });
    const members = [member('madou.4321'), member('blastrn.1234')];

    before(async () => {
      account
        .withArgs(token.token)
        .returns(Promise.resolve(accountInfoData));

      guilds.forEach((guild) => {
        readGuild
          .withArgs(token.token, guild.id)
          .returns(Promise.resolve(guild));

        readGuildMembers
          .withArgs(token.token, guild.id)
          .returns(members);
      });

      await fetcher(models, token);
    });

    it('should check if token is a guild leader', () => {
      expect(account).to.have.been.calledWith(token.token);
    });

    it('should associate guilds that token is a leader of', async () => {
      const guildz = await findGuilds();

      guildz.forEach((guild) => expect(guild.apiTokenId).to.equal(token.id));
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

    it('should bulk create found users', () => {
      guilds.forEach(({ id }) => {
        expect(bulkCreateStubUser).to.have.been.calledWith(models, members.map((mbr) => ({
          accountName: mbr.name,
          guilds: [id],
        })));
      });
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
