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

  const token = testData.apiToken();
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

  before(async () => {
    models = await setupTestDb({ seed: true });
    readPvpStandings.withArgs(token.token).returns(Promise.resolve(standings));
    readPvpStats.withArgs(token.token).returns(Promise.resolve(stats));

    await pvpStandingsFetcher(models, token);
    await pvpStandingsFetcher(models, token);
  });

  it('should insert all pvp data into db', async () => {
    const rows = await models.PvpStandings.findAll({
      order: ['createdAt'],
    });

    expect(rows.length).to.equal(standings.length);
    rows.map((row) => row.dataValues).forEach((row, index) => {
      const pvpStanding = standings[index];

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

        // wins: stats.ladders.ranked.wins,
        // losses: stats.ladders.ranked.losses,
      });
    });
  });
});
