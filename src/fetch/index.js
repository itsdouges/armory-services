// @flow

/* eslint import/imports-first:off */

import '../base';

import { models, sync } from 'lib/db';
import restify from 'restify';
import config from 'config';
import createLog from 'lib/logger';

import userFetchFactory from './userFetch';
import fetchFactory from './fetch';

const { fetchAll, fetch } = userFetchFactory(models, [
  require('./fetchers/guilds').default,
  require('./fetchers/characters').default,
  require('./fetchers/account').default,
  require('./fetchers/pvpStandings').default,
]);

const server = restify.createServer({
  name: 'gw2-fetch',
});

server.use(restify.bodyParser());

server.get('/healthcheck', (req, res, next) => {
  res.send(200, 'hi, im alive');
  return next();
});

server.post('/fetch', async (req, res, next) => {
  console.log();
  console.log(`>>> Fetching for ${req.params.token} triggered...`);
  console.log();

  try {
    await fetch({
      token: req.params.token,
      id: req.params.id,
      permissions: req.params.permissions,
    });

    res.send(200);
  } catch (e) {
    console.log(e);
    res.send(500, e);
  }

  return next();
});

sync()
  .then(() => {
    try {
      console.log();
      console.log(`>>> Starting server on port ${config.fetch.port}...`);
      console.log();

      server.listen(config.fetch.port);
      createLog('fetch', 'fetch').log(':wave:');

      if (config.fetch.disabled) {
        return;
      }

      fetchAll();
      setInterval(fetchAll, config.fetch.interval);

      fetchFactory(models, [{
        fetcher: require('./fetchers/pvpLeaderboard').default,
        interval: config.leaderboards.refreshInterval,
        callImmediately: true,
      }]);
    } catch (e) {
      console.log(e);
    }
  });

