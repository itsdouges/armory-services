// @flow
/* eslint import/imports-first:off */

import '../base';
import 'babel-polyfill';

const Sequelize = require('sequelize');
const restify = require('restify');

const fetchFactory = require('./fetch');
const Models = require('lib/models');

const config = require('config');

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);

const { batchFetch, fetch } = fetchFactory(models, [
  // TODO: Dynamic import of fetchers, maybe?
  require('./fetchers/guilds').default,
  require('./fetchers/characters'),
  require('./fetchers/account'),
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
