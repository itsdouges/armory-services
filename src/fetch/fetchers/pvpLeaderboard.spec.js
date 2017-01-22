import { stubLogger } from 'test/utils';
import * as testData from 'test/testData';

const sandbox = sinon.sandbox.create();
const readLatestPvpSeason = sandbox.stub();
const listStandings = sandbox.stub();
const saveStandings = sandbox.stub();
const readUser = sandbox.stub();
const readPvpLadder = sandbox.stub();
const createStubUser = sandbox.stub();
const buildLadderByAccountName = sandbox.stub();

const fetcher = proxyquire('fetch/fetchers/pvpLeaderboard', {
  'lib/gw2': {
    readLatestPvpSeason,
    readPvpLadder,
  },
  'lib/services/pvpStandings': {
    list: listStandings,
    saveList: saveStandings,
  },
  'lib/services/user': {
    read: readUser,
    createStubUser,
  },
  '../lib/leaderboard': buildLadderByAccountName,
  ...stubLogger(),
});

describe('pvp leaderboard fetcher', () => {
  const seasonId = '1234-1234-1234';
  const models = { i: 'exit' };
  const apiTokenId = 5;
  const apiTokenId2 = 9;

  const standings = [{
    ratingCurrent: 100,
    decayCurrent: 100,
    apiTokenId: 1,
  }, {
    ratingCurrent: 1500,
    decayCurrent: 500,
    apiTokenId: 2,
  }, {
    ratingCurrent: 2000,
    decayCurrent: 1500,
    apiTokenId: 3,
  }, {
    ratingCurrent: 1100,
    decayCurrent: 0,
    apiTokenId: 4,
  }].map((standing) => (testData.dbStanding(standing)));

  const toLadder = (names) =>
    names.map((name, index) => testData.gw2LadderStanding({ name, rank: index }));

  const standingg = (apiTokenId, rank, key) => ({
    apiTokenId,
    seasonId,
    [key]: rank,
  });

  const naLadder = toLadder([
    'madou.1234',
    'ira.4321',
    'dragon.9281',
  ]);

  const euLadder = toLadder([
    'king.1234',
    'queen.4444',
    'winner.1299',
  ]);

  before(() => {
    readLatestPvpSeason.returns({ id: seasonId, active: true });
    listStandings.withArgs(models, seasonId).returns(standings);

    readPvpLadder.withArgs(null, seasonId, { region: 'na' }).returns(naLadder);
    readPvpLadder.withArgs(null, seasonId, { region: 'eu' }).returns(euLadder);

    readUser.withArgs(models, { accountName: naLadder[1].name }).returns({
      token: '1234',
      accountName: naLadder[1].name,
    });

    readUser.withArgs(models, { accountName: euLadder[1].name }).returns({
      token: '4321',
      accountName: euLadder[1].name,
    });

    buildLadderByAccountName.withArgs(models, naLadder).returns([
      standingg(apiTokenId, 2, 'naRank'),
      standingg(standings[1].apiTokenId, 1, 'naRank'),
    ]);

    buildLadderByAccountName.withArgs(models, euLadder).returns([
      standingg(standings[2].apiTokenId, 5, 'euRank'),
      standingg(apiTokenId2, 2, 'euRank'),
    ]);
  });

  const addRanking = (stnding, gw2aRank, naRank, euRank) => ({
    ...stnding,
    gw2aRank,
    naRank,
    euRank,
  });

  const [
    standingOne,
    standingTwo,
    standingThree,
    standingFour,
  ] = standings;

  before(async () => await fetcher(models));

  it('should add any users who arent in the db', () => {
    expect(createStubUser).to.have.been.calledWith(models, euLadder[0].name);
    expect(createStubUser).to.have.been.calledWith(models, euLadder[2].name);
    expect(createStubUser).to.have.been.calledWith(models, naLadder[0].name);
    expect(createStubUser).to.have.been.calledWith(models, naLadder[2].name);
  });

  it('should save standings', async () => {
    expect(saveStandings).to.have.been.calledWith(models, [
      addRanking(standingFour, 1, null, null),
      addRanking(standingTwo, 2, 1, null),
      addRanking(standingThree, 3, null, 5),
      addRanking(standingOne, 4, null, null), {
        apiTokenId,
        gw2aRank: null,
        naRank: 2,
        seasonId: '1234-1234-1234',
      }, {
        apiTokenId: apiTokenId2,
        euRank: 2,
        gw2aRank: null,
        seasonId: '1234-1234-1234',
      },
    ]);
  });
});
