const restify = require('restify');
const axios = require('axios');
const restifyOAuth2 = require('restify-oauth2');
const GottaValidate = require('gotta-validate');

const usersControllerFactory = require('./controllers/user');
const characterControllerFactory = require('./controllers/character');
const authControllerFactory = require('./controllers/auth');
const gw2ApiFactory = require('./lib/gw2');
const sitemapControllerFactory = require('./controllers/sitemap');
const statisticsControllerFactory = require('./controllers/statistics');

const CheckController = require('./controllers/check');
const Gw2TokenController = require('./controllers/gw2-token');
const PvpController = require('./controllers/pvp');

function serverFactory (models, config) {
  GottaValidate.addDefaultRules();
  GottaValidate
    .addRule({
      name: 'valid-gw2-token',
      func: require('./lib/rules/valid-gw2-token'),
      dependencies: {
        axios,
        models,
        env: config,
      },
    })
    .addRule({
      name: 'unique-email',
      func: require('./lib/rules/unique-email'),
      inherits: 'email',
      dependencies: {
        models,
      },
    })
    .addRule({
      name: 'unique-alias',
      func: require('./lib/rules/unique-alias'),
      dependencies: {
        models,
      },
    })
    .addRule({
      name: 'min5',
      func: require('./lib/rules/min').five,
    })
    .addRule({
      name: 'ezpassword',
      func: require('./lib/rules/password'),
    });

  const gw2Api = gw2ApiFactory(axios, config);
  const characters = characterControllerFactory(models, gw2Api);

  const gw2Tokens = new Gw2TokenController(models, GottaValidate, gw2Api);
  const checks = new CheckController(GottaValidate);
  const pvp = new PvpController(models, gw2Api);

  const server = restify.createServer({
    name: 'api.gw2armory.com',
    version: config.version,
  });

  restify.CORS.ALLOW_HEADERS.push('authorization');
  restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');

  // eslint-disable-next-line
  server.use(restify.CORS({
    origins: config.allowed_cors,
  }));

  server.use(restify.authorizationParser());
  server.use(restify.bodyParser());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());

  restifyOAuth2.ropc(server, {
    tokenEndpoint: '/token',
    hooks: authControllerFactory(models, config),
    tokenExpirationTime: config.jwt_tokens.expires_in,
  });

  require('./resources')(server);
  require('./resources/pvp')(server, pvp);
  require('./resources/characters')(server, characters);
  require('./resources/guilds')(server, models);
  require('./resources/search')(server, models);
  require('./resources/users/check')(server, checks);
  require('./resources/users/gw2-token')(server, gw2Tokens);
  require('./resources/users/characters')(server, characters);
  require('./resources/sign-upload')(server, models);

  require('./resources/statistics')(server, statisticsControllerFactory(models));
  require('./resources/users')(server, usersControllerFactory(models, GottaValidate, gw2Api));
  require('./resources/sitemap')(server, sitemapControllerFactory(models));

  return server;
}

module.exports = serverFactory;
