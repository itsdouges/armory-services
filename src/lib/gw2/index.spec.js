const _ = require('lodash');

const config = {
  gw2: {
    endpoint: 'https://gw2apis.com/',
  },
  leaderboards: {
    latestSeasonCacheTtl: 123,
    backupLatestSeasonId: 'cool-meme',
  },
  cache: {
    gw2Api: 5000,
  },
};

const axiosGet = sinon.stub();

const gw2Api = proxyquire('lib/gw2', {
  axios: {
    get: axiosGet,
  },
  config,
  memoizee: (func) => func,
});

describe('gw2 api', () => {
  const token = '1234-1234-1234';

  beforeEach(() => axiosGet.reset());

  const stubAxiosGet = (resource, data, id = '') => {
    let endpoint = `${config.gw2.endpoint}v2/${resource}`;
    if (id) {
      endpoint = endpoint.replace('{id}', id);
    }

    axiosGet
      .withArgs(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .returns(Promise.resolve({ data }));
  };

  describe('pvp games', () => {
    it('should read pvp games', () => {
      const data = [1, 2, 3, 4];
      const games = { cool: 'games' };

      stubAxiosGet('pvp/games', data);
      stubAxiosGet(`pvp/games?ids=${data.join(',')}`, games);

      return gw2Api.readPvpGames(token)
        .then((result) => expect(result).to.equal(games));
    });

    it('should not explode if there were no games found', () => {
      const data = [undefined];

      stubAxiosGet('pvp/games', data);

      return gw2Api.readPvpGames(token).then((result) => expect(result).to.eql([]));
    });
  });

  it('should export expected functions', () => {
    expect(gw2Api).to.have.keys([
      'readAccount',
      'readAchievements',
      'readCharacter',
      'readCharacters',
      'readCharactersDeep',
      'readPvpGames',
      'readPvpStandings',
      'readPvpStats',
      'readGuild',
      'readGuildPublic',
      'readGuildLogs',
      'readGuildMembers',
      'readGuildRanks',
      'readGuildStash',
      'readGuildTreasury',
      'readGuildTeams',
      'readGuildUpgrades',
      'readTokenInfo',
      'readTokenInfoWithAccount',
      'readPvpLadder',
      'readLatestPvpSeason',
    ]);
  });

  describe('simple calls', () => {
    _.forEach({
      readPvpStandings: { resource: 'pvp/standings' },
      readPvpStats: { resource: 'pvp/stats' },
      readAccount: { resource: 'account', normalise: true },
      readTokenInfo: { resource: 'tokeninfo' },
      readCharacters: { resource: 'characters' },
      readCharactersDeep: { resource: 'characters?page=0&page_size=200' },
      readCharacter: { resource: 'characters/{id}', id: 'Blastrn' },
      readGuild: { resource: 'guild/{id}', id: '1234-1234' },
      readGuildLogs: { resource: 'guild/{id}/log', id: '1234-1234' },
      readGuildRanks: { resource: 'guild/{id}/ranks', id: '1234-1234' },
      readGuildMembers: { resource: 'guild/{id}/members', id: '1234-1234' },
      readGuildStash: { resource: 'guild/{id}/stash', id: '1234-1234' },
      readGuildTreasury: { resource: 'guild/{id}/treasury', id: '1234-1234' },
      readGuildTeams: { resource: 'guild/{id}/teams', id: '1234-1234' },
      readGuildUpgrades: { resource: 'guild/{id}/upgrades', id: '1234-1234' },
      readAchievements: { resource: 'account/achievements' },
    }, ({ resource, id, normalise }, funcName) => {
      it(`should call ${funcName} and resolve data`, async () => {
        const data = { some_data: 'data' };
        const normalisedData = { someData: 'data' };

        stubAxiosGet(resource, data, id);

        const result = await gw2Api[funcName](token, id);

        expect(result).to.eql(normalise ? normalisedData : data);
      });
    });
  });

  describe('calls with params', () => {
    describe('read pvp ladder', () => {
      it('should get data', async () => {
        const id = '1234-1234';
        const region = 'na';
        // eslint-disable-next-line max-len
        const resource = `${config.gw2.endpoint}v2/pvp/seasons/${id}/leaderboards/ladder/${region}?page_size=200`;
        const data = [{ neat: 'data' }];

        // dirty pagination hacks
        axiosGet.withArgs(`${resource}{page}`).returns(Promise.resolve({ data }));
        axiosGet.withArgs(`${resource}&page=1`).returns(Promise.resolve({ data }));

        const result = await gw2Api.readPvpLadder(null, id, { region });

        expect(result).to.eql(data.concat(data));
      });
    });
  });

  describe('reading latest pvp season', () => {
    context('when api call fails', () => {
      it('should return backup season id', async () => {
        axiosGet
          .withArgs(`${config.gw2.endpoint}v2/pvp/seasons?page=0&page_size=200`)
          .returns(Promise.reject());

        const season = await gw2Api.readLatestPvpSeason();

        expect(season).to.eql({
          id: config.leaderboards.backupLatestSeasonId,
        });
      });
    });
  });
});
