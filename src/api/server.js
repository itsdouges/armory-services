// @flow

import restify from 'restify';
import axios from 'axios';
import restifyOAuth2 from 'restify-oauth2';
import createValidator from 'gotta-validate';

import type { Models } from 'flowTypes';

import gw2Api from 'lib/gw2';
import tokenControllerFactory from './controllers/gw2-token';
import usersControllerFactory from './controllers/user';
import characterControllerFactory from './controllers/character';

const authControllerFactory = require('./controllers/auth');
const sitemapControllerFactory = require('./controllers/sitemap');
const statisticsControllerFactory = require('./controllers/statistics');

const CheckController = require('./controllers/check');
const PvpController = require('./controllers/pvp');

export default function createServer (models: Models, config: any) {
  createValidator.addDefaultRules();
  createValidator
    .addRule({
      name: 'valid-gw2-token',
      func: require('lib/rules/valid-gw2-token'),
      dependencies: {
        axios,
        models,
        env: config,
      },
    })
    .addRule({
      name: 'unique-email',
      func: require('lib/rules/unique-email'),
      inherits: 'email',
      dependencies: {
        models,
      },
    })
    .addRule({
      name: 'unique-alias',
      func: require('lib/rules/unique-alias'),
      dependencies: {
        models,
      },
    })
    .addRule({
      name: 'min5',
      func: require('lib/rules/min').five,
    })
    .addRule({
      name: 'ezpassword',
      func: require('lib/rules/password'),
    });

  const gw2Tokens = tokenControllerFactory(models, createValidator, gw2Api);

  const checks = new CheckController(createValidator);
  const pvp = new PvpController(models, gw2Api);

  const server = restify.createServer({
    name: 'api.gw2armory.com',
    version: config.version,
  });

  restify.CORS.ALLOW_HEADERS.push('authorization');
  restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');

  // eslint-disable-next-line new-cap
  server.use(restify.CORS({
    origins: config.allowedCors,
  }));

  server.use(restify.authorizationParser());
  server.use(restify.bodyParser());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());

  restifyOAuth2.ropc(server, {
    tokenEndpoint: '/token',
    hooks: authControllerFactory(models, config),
    tokenExpirationTime: config.jwtTokens.expiresIn,
  });

  require('./resources')(server);
  require('./resources/pvp')(server, pvp);
  require('./resources/guilds')(server, models);
  require('./resources/search')(server, models);
  require('./resources/users/check')(server, checks);
  require('./resources/users/gw2-token')(server, gw2Tokens);
  require('./resources/sign-upload')(server, models);

  require('./resources/characters')(server, characterControllerFactory(models));
  require('./resources/statistics')(server, statisticsControllerFactory(models));
  require('./resources/users').default(server, usersControllerFactory(models));
  require('./resources/sitemap')(server, sitemapControllerFactory(models));

  return server;
}
