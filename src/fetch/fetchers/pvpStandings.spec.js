import * as testData from 'test/testData/db';
import * as gw2 from 'test/testData/gw2';

const sandbox = sinon.sandbox.create();
const readPvpStandings = sandbox.stub();
const readPvpStats = sandbox.stub();

const pvpStandingsFetcher = proxyquire('fetch/fetchers/pvpStandings', {
  'lib/gw2': {
    readPvpStandings,
    readPvpStats,
  },
});

describe('pvp standings fetcher', () => {
  let models;

  const token = testData.apiToken({
    permissions: 'pvp',
  });
  const stats = gw2.pvpStats();

  const standings = [
    gw2.pvpStanding({
      season_id: '1111',
    }),
    gw2.pvpStanding({
      season_id: '2222',
    }),
    gw2.pvpStanding({
      season_id: '3333',
    }),
  ];

  beforeEach(async () => {
    models = await setupTestDb({ seed: true });
    readPvpStandings.withArgs(token.token).returns(Promise.resolve(standings));
    readPvpStats.withArgs(token.token).returns(Promise.resolve(stats));
  });

  afterEach(() => sandbox.reset());

  it('should resolve immediately if user doesnt have pvp permission', async () => {
    await await pvpStandingsFetcher(models, { permissions: '' });

    expect(readPvpStandings).to.not.have.been.called;
  });

  it('should insert all pvp data into db', async () => {
    const doubleStandings = [].concat(standings).concat(standings);
    await pvpStandingsFetcher(models, token);
    await pvpStandingsFetcher(models, token);

    const rows = await models.PvpStandings.findAll({
      order: ['createdAt'],
    });

    expect(rows.length).to.equal(doubleStandings.length);
    rows.map(row => row.dataValues).forEach((row, index) => {
      const pvpStanding = doubleStandings[index];

      expect(row).to.include({
        seasonId: pvpStanding.season_id,
        apiTokenId: token.id,

        totalPointsCurrent: pvpStanding.current.total_points,
        divisionCurrent: pvpStanding.current.division,
        pointsCurrent: pvpStanding.current.points,
        repeatsCurrent: pvpStanding.current.repeats,
        ratingCurrent: pvpStanding.current.rating,
        decayCurrent: pvpStanding.current.decay,

        totalPointsBest: pvpStanding.best.total_points,
        divisionBest: pvpStanding.best.division,
        pointsBest: pvpStanding.best.points,
        repeatsBest: pvpStanding.best.repeats,
        ratingBest: pvpStanding.best.rating,
        decayBest: pvpStanding.best.decay,
      });
    });
  });
});
