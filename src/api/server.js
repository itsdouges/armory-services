// @flow
/* eslint import/imports-first:0 */

import type { Models } from 'flowTypes';

import restify from 'restify';
import axios from 'axios';
import restifyOAuth2 from 'restify-oauth2';
import createValidator from 'gotta-validate';
import config from 'config';
import corsMiddleware from 'restify-cors-middleware';

import tokenControllerFactory from './controllers/gw2-token';
import usersControllerFactory from './controllers/user';
import characterControllerFactory from './controllers/character';
import pvpControllerFactory from './controllers/pvp';
import sitemapControllerFactory from './controllers/sitemap';
import checkControllerFactory from './controllers/check';
import authControllerFactory from './controllers/auth';
import statisticsControllerFactory from './controllers/statistics';

export default function createServer (models: Models) {
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

  const server = restify.createServer({
    name: 'api.gw2armory.com',
    version: config.version,
  });

  const cors = corsMiddleware({
    origins: config.allowedCors,
    allowHeaders: ['Authorization', 'Access-Control-Allow-Origin'],
  });

  server.pre(cors.preflight);
  server.use(cors.actual);
  server.use(restify.plugins.authorizationParser());
  server.use(restify.plugins.bodyParser({
    mapParams: true,
  }));
  server.use(restify.plugins.queryParser({
    mapParams: true,
  }));
  server.use(restify.plugins.gzipResponse());

  restifyOAuth2.ropc(server, {
    tokenEndpoint: '/token',
    hooks: authControllerFactory(models, config),
    tokenExpirationTime: config.jwtTokens.expiresIn,
  });

  require('./resources').default(server);
  require('./resources/guilds').default(server, models);
  require('./resources/search').default(server, models);
  require('./resources/sign-upload').default(server, models);
  require('./resources/users/check').default(server, checkControllerFactory(createValidator));
  require('./resources/users/gw2-token').default(
    server,
    tokenControllerFactory(models, createValidator)
  );
  require('./resources/pvp').default(server, pvpControllerFactory(models));
  require('./resources/characters').default(server, characterControllerFactory(models));
  require('./resources/statistics').default(server, statisticsControllerFactory(models));
  require('./resources/users').default(server, usersControllerFactory(models));
  require('./resources/sitemap').default(server, sitemapControllerFactory(models));

  return server;
}
