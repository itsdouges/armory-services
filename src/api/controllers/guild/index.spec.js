import _ from 'lodash';

import * as testData from 'test/testData/db';

const config = {
  cache: {
    findAllCharacters: 12,
    resourceOfTheDay: 10,
  },

  ofTheDay: {
    guilds: 1,
  },
};

const sandbox = sinon.sandbox.create();
const readGuild = sandbox.stub();
const readGuildPrivate = sandbox.stub();
const listGuilds = sandbox.stub();
const listCharacters = sandbox.stub();
const listUsers = sandbox.stub();
const canAccess = sandbox.stub();

const readGuildLogs = sandbox.stub();
const readGuildMembers = sandbox.stub();
const readGuildRanks = sandbox.stub();
const readGuildStash = sandbox.stub();
const readGuildTreasury = sandbox.stub();
const readGuildTeams = sandbox.stub();
const readGuildUpgrades = sandbox.stub();
const readToken = sandbox.stub();
const tryFetch = sandbox.spy();

const controller = proxyquire('api/controllers/guild', {
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
  './access': canAccess,
  'lib/gw2': {
    readGuildLogs,
    readGuildMembers,
    readGuildRanks,
    readGuildStash,
    readGuildTreasury,
    readGuildTeams,
    readGuildUpgrades,
  },
  'lib/services/tokens': {
    read: readToken,
  },
  'lib/services/fetch': { tryFetch },
});

describe('guild controller', () => {
  const models = { stub: 'models' };
  const limit = 2;
  const offset = 3;

  let sut;

  const apiToken = testData.apiToken();

  const guildData = testData.guild({
    apiTokenId: apiToken.id,
  });

  const guilds = [
    testData.guild(),
    testData.guild(),
    testData.guild(),
    testData.guild(),
  ];

  const characters = {
    count: 4,
    rows: [
      testData.character(),
      testData.character(),
    ],
  };

  const users = {
    count: 2,
    rows: [
      testData.user(),
      testData.user(),
    ],
  };

  before(() => {
    readGuild
      .withArgs(models, { name: 'name' })
      .returns(Promise.resolve(guildData));

    listCharacters
      .withArgs(models, { guild: guildData.id, limit, offset })
      .returns(Promise.resolve(characters));

    listUsers
      .withArgs(models, { guild: guildData.id, limit, offset })
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
            expect(guild).to.eql(_.pick(guildData, [
              'name',
              'id',
              'tag',
              'claimed',
            ]));
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

        expect(tryFetch).to.have.been.calledWith(models, apiToken.id);
        expect(guild).to.eql(guildData);
      });
    });
  });

  describe('reading users in a guild', () => {
    it('should output all data', async () => {
      const email = 'cool@kkkemail.com';

      const guildUsers = await sut.readUsers(guildData.name, { email, limit, offset });

      expect(guildUsers).to.eql(users);
    });
  });

  describe('reading characters in a guild', () => {
    it('should output all data', async () => {
      const email = 'cool@kkkemail.com';

      const guildCharacters = await sut.readCharacters(guildData.name, { email, limit, offset });

      expect(guildCharacters).to.eql(characters);
    });
  });

  it('should select random guild', async () => {
    const guild = await sut.random(2);
    expect(guild.length).to.equal(2);
  });

  it('should select guilds of the day', async () => {
    const ofTheDay = await sut.guildsOfTheDay();

    expect(ofTheDay.length).to.equal(config.ofTheDay.guilds);
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
            const guild = { name, id: 'hahaha', apiTokenId: apiToken.id };

            readToken.withArgs(models, { id: guild.apiTokenId }).returns(Promise.resolve(apiToken));
            readGuildPrivate.withArgs(models, { name }).returns(guild);
            apiFunc.withArgs(apiToken.token, guild.id).returns(Promise.resolve(data));

            canAccess
              .withArgs(models, { type: key, guildName: name, email })
              .returns(Promise.resolve(true));

            const actual = await sut[key](name, { email });

            expect(tryFetch).to.have.been.calledWith(models, apiToken.id);
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
