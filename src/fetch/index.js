// @flow

/* eslint import/imports-first:off */

import '../base';
import Sequelize from 'sequelize';
import restify from 'restify';
import Models from 'lib/models';
import config from 'config';
import tokenFetchFactory from './tokenFetch';
import bespokeFetch from './bespokeFetch';

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password, config.db
);

const models = new Models(db);

const { batchFetch, fetch } = tokenFetchFactory(models, [
  require('./fetchers/guilds').default,
  require('./fetchers/characters').default,
  require('./fetchers/account').default,
  require('./fetchers/pvpStandings').default,
]);

const server = restify.createServer({
  name: 'gw2-fetch',
});

server.use(restify.bodyParser());

server.get('/', (req, res, next) => {
  res.send(200, 'hi, im alive');
  return next();
});

server.post('/fetch', async (req, res, next) => {
  console.log(`\n=== Single fetch triggered for ${req.params.token} ===\n`);

  try {
    await fetch({
      token: req.params.token,
      permissions: req.params.permissions,
    });

    res.send(200);
  } catch (e) {
    res.send(500, e);
  }

  return next();
});

models.sequelize.sync()
  .then(() => {
    console.log(`\n=== Starting server on port ${config.fetch.port}.. ===\n`);

    server.listen(config.fetch.port);

    batchFetch();

    setInterval(batchFetch, config.fetch.interval);

    bespokeFetch(models, [{
      fetcher: require('./fetchers/pvpLeaderboard').default,
      interval: config.leaderboards.refreshInterval,
      callImmediately: true,
    }]);
  });
