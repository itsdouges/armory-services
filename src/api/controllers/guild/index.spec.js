import proxyquire from 'proxyquire';
import _ from 'lodash';

import * as testData from 'test/testData';

const config = {
  cache: {
    findAllCharacters: 12,
  },
};

const readGuild = sinon.stub();
const readGuildPrivate = sinon.stub();
const listGuilds = sinon.stub();
const listCharacters = sinon.stub();
const listUsers = sinon.stub();
const canAccess = sinon.stub();

const readGuildLogs = sinon.stub();
const readGuildMembers = sinon.stub();
const readGuildRanks = sinon.stub();
const readGuildStash = sinon.stub();
const readGuildTreasury = sinon.stub();
const readGuildTeams = sinon.stub();
const readGuildUpgrades = sinon.stub();

const { default: controller } = proxyquire('./index', {
  config,
  'lib/services/guild': {
    read: readGuild,
    list: listGuilds,
    readPrivate: readGuildPrivate,
  },
  'lib/services/character': {
    list: listCharacters,
  },
  'lib/services/user': {
    list: listUsers,
  },
  './access': { default: canAccess },
  'lib/gw2': {
    readGuildLogs,
    readGuildMembers,
    readGuildRanks,
    readGuildStash,
    readGuildTreasury,
    readGuildTeams,
    readGuildUpgrades,
  },
});

describe('guild controller', () => {
  const models = { stub: 'models' };

  let sut;

  const guildData = testData.guild();

  const guilds = [
    testData.guild(),
    testData.guild(),
    testData.guild(),
    testData.guild(),
  ];

  const characters = [
    testData.character(),
    testData.character(),
  ];
  const users = [
    testData.user(),
    testData.user(),
  ];

  before(() => {
    readGuild
      .withArgs(models, { name: 'name' })
      .returns(Promise.resolve(guildData));

    listCharacters
      .withArgs(models, { guild: guildData.id })
      .returns(Promise.resolve(characters));

    listUsers
      .withArgs(models, { guild: guildData.id })
      .returns(Promise.resolve(users));

    listGuilds
      .withArgs(models)
      .returns(Promise.resolve(guilds));

    sut = controller(models);
  });

  describe('reading guild', () => {
    context('when user does not have access', () => {
      it('should output subset of data', () => {
        const email = 'email@email.com';

        canAccess
          .withArgs(models, { type: 'read', email, name: guildData.name })
          .returns(Promise.resolve(false));

        return sut.read(guildData.name, { email })
          .then((guild) => {
            expect(guild).to.eql({
              ..._.pick(guildData, [
                'name',
                'id',
                'tag',
                'claimed',
              ]),
              characters,
              users,
            });
          });
      });
    });

    context('when user does have access', () => {
      it('should output all data', async () => {
        const email = 'cool@kkkemail.com';

        canAccess
          .withArgs(models, sinon.match({ type: 'read', email, guildName: guildData.name }))
          .returns(Promise.resolve(true));

        const guild = await sut.read(guildData.name, { email });

        expect(guild).to.eql({
          ...guildData,
          characters,
          users,
        });
      });
    });
  });

  it('should select random guild', () => {
    return sut.random(2)
      .then((guild) => expect(guild.length).to.equal(2));
  });

  _.forEach({
    logs: readGuildLogs,
    members: readGuildMembers,
    ranks: readGuildRanks,
    stash: readGuildStash,
    treasury: readGuildTreasury,
    teams: readGuildTeams,
    upgrades: readGuildUpgrades,
  }, (apiFunc, key) => {
    describe(key, () => {
      const email = 'email@gmail.com';
      const data = ['cool', 'logs'];

      context('when user has access', () => {
        context('and a access token', () => {
          it(`should return ${key}`, async () => {
            const name = 'guild-name';
            const guild = { name, id: 'hahaha', apiToken: '1234-1234' };
            readGuildPrivate.withArgs(models, { name }).returns(guild);
            apiFunc.withArgs(guild.apiToken, guild.id).returns(Promise.resolve(data));

            canAccess
              .withArgs(models, { type: key, guildName: name, email })
              .returns(Promise.resolve(true));

            const actual = await sut[key](name, { email });

            expect(actual).to.equal(data);
          });
        });

        context('and no access token', () => {
          it('should return empty array', async () => {
            const name = 'guild-name-1';
            const guild = {};
            readGuildPrivate.withArgs(models, { name }).returns(guild);

            canAccess
              .withArgs(models, { type: key, guildName: name, email })
              .returns(Promise.resolve(true));

            const actual = await sut[key](name, { email });

            expect(actual).to.eql([]);
          });
        });
      });

      context('when user does not have access', () => {
        it('should return empty array', async () => {
          const name = 'guild-name-2';

          canAccess
            .withArgs(models, { type: key, guildName: name, email })
            .returns(Promise.resolve(false));

          const actual = await sut[key](name, { email });

          expect(actual).to.eql([]);
        });
      });
    });
  });
});
