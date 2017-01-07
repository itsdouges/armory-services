// @flow
/* eslint import/imports-first:off */

import '../base';
import 'babel-polyfill';
import Sequelize from 'sequelize';
import restify from 'restify';
import Models from 'lib/models';
import config from 'config';
import fetchFactory from './fetch';

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);

const { batchFetch, fetch } = fetchFactory(models, [
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

server.post('/fetch', (req, res, next) => {
  console.log(`\n=== Single fetch triggered for ${req.params.token} ===\n`);

  fetch({ token: req.params.token, permissions: req.params.permissions })
    .then(() => {
      res.send(200);
      return next();
    }, (err) => {
      res.send(500, err);
      return next();
    });
});

models.sequelize.sync()
  .then(() => {
    console.log(`\n=== Starting server on port ${config.fetch.port}.. ===\n`);

    server.listen(config.fetch.port);

    batchFetch();

    setInterval(batchFetch, config.fetch.interval);
  });
