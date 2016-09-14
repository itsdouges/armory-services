var restify = require("restify"),
  restifyOAuth2 = require("restify-oauth2"),
  GottaValidate = require('gotta-validate'),
  axios = require('axios'),
  usersControllerFactory = require('./controllers/user'),
  CheckController = require('./controllers/check'),
  Gw2TokenController = require('./controllers/gw2-token'),
  CharacterController = require('./controllers/character'),
  AuthController = require('./controllers/auth'),
  Gw2Api = require('./lib/gw2'),
  PvpController = require('./controllers/pvp');

const sitemapControllerFactory = require('./controllers/sitemap');

function Server(models, config) {
  GottaValidate.addDefaultRules();
  GottaValidate
    .addRule({
      name: 'valid-gw2-token',
      func: require('./lib/rules/valid-gw2-token'),
      dependencies: {
        axios: axios,
        models: models,
        env: config
      }
    })
    .addRule({
      name: 'unique-email',
      func: require('./lib/rules/unique-email'),
      inherits: 'email',
      dependencies: {
        models: models
      }
    })
    .addRule({
      name: 'unique-alias',
      func: require('./lib/rules/unique-alias'),
      dependencies: {
        models: models
      }
    })
    .addRule({
      name: 'min5',
      func: require('./lib/rules/min').five
    })
    .addRule({
      name: 'ezpassword',
      func: require('./lib/rules/password')
    });

  var gw2Api = Gw2Api(axios, config);

  var gw2Tokens = new Gw2TokenController(models, GottaValidate, gw2Api);
  var characters = new CharacterController(models, gw2Api);
  var checks = new CheckController(GottaValidate);
  var auths = AuthController(models, config);
  var pvp = new PvpController(models, gw2Api);

  var server = restify.createServer({
    name: "api.gw2armory.com",
    version: config.version,
  });

  restify.CORS.ALLOW_HEADERS.push('authorization');
  restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
  server.use(restify.CORS({
    origins: config.allowed_cors,
  }));

  server.use(restify.authorizationParser());
  server.use(restify.bodyParser());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());

  restifyOAuth2.ropc(server, {
    tokenEndpoint: '/token',
    hooks: auths,
    tokenExpirationTime: config.jwt_tokens.expires_in,
  });

  require('./resources')(server);
  require('./resources/pvp')(server, pvp);
  require('./resources/characters')(server, characters);
  require('./resources/guilds')(server, models);
  require('./resources/search')(server, models);
  require('./resources/users')(server, usersControllerFactory(models, GottaValidate, gw2Api));
  require('./resources/users/check')(server, checks);
  require('./resources/users/gw2-token')(server, gw2Tokens);
  require('./resources/users/characters')(server, characters);
  require('./resources/sign-upload')(server, models);
  require('./resources/sitemap')(server, sitemapControllerFactory(models));

  return server;
}

module.exports = Server;
