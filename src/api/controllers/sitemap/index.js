// @flow

import type { Models } from 'flowTypes';
import config from 'config';

const userRoutes = [{
  loc: '',
  priority: '1.0',
}, {
  loc: '/characters',
  priority: '0.9',
}, {
  loc: '/matches',
  priority: '0.5',
}, {
  loc: '/guilds',
  priority: '0.5',
}];

const guildRoutes = [{
  loc: '',
  priority: '0.9',
}, {
  loc: '/users',
  priority: '0.8',
}, {
  loc: '/characters',
  priority: '0.8',
}, {
  loc: '/logs',
  priority: '0.4',
}];

const characterRoutes = [{
  loc: '',
  priority: '1.0',
}];

const publicRoutes = [{
  loc: '',
  priority: '1.0',
}, {
  loc: 'join',
  priority: '0.6',
}, {
  loc: 'login',
  priority: '0.5',
}, {
  loc: 'statistics',
  priority: '0.9',
}, {
  loc: 'leaderboards',
  priority: '0.9',
}, {
  loc: 'embeds',
  priority: '0.4',
}];

type BuildUrlTemplateOptions = {
  loc: string,
  priority: string,
  updatedAt?: Date,
};

const buildUrlTemplate = ({ loc, updatedAt, priority }: BuildUrlTemplateOptions) =>
`  <url>
    <loc>${config.web.publicUrl}/${loc}</loc>
    <lastmod>${updatedAt ? updatedAt.toISOString() : ''}</lastmod>
    <priority>${priority}</priority>
  </url>`;

const buildSitemap = (items) =>
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(buildUrlTemplate).join('\n')}
${items.reduce((str, item) => {
  // eslint-disable-next-line no-param-reassign
  str += `${item.join('\n')}\n`;
  return str;
}, '')}
</urlset>`;

module.exports = function sitemapControllerFactory (models: Models) {
  function getAllResources () {
    return Promise.all([
      models.User.findAll(),
      models.Gw2Guild.findAll(),
      models.Gw2Character.findAll({
        include: [{
          model: models.Gw2ApiToken,
          include: [{
            model: models.User,
          }],
        }],
      }),
    ]);
  }

  function generate () {
    return getAllResources()
      .then(([users, guilds, characters]) => buildSitemap([
        ...userRoutes.map(
          (route) => users.map((user) => buildUrlTemplate({
            loc: `${user.alias}${route.loc}`,
            priority: route.priority,
            updatedAt: user.updatedAt,
          }))
        ),
        ...guildRoutes.map(
          (route) => guilds.map((guild) => buildUrlTemplate({
            loc: `g/${guild.name}${route.loc}`,
            priority: route.priority,
            updatedAt: guild.updatedAt,
          }))
        ),
        ...characterRoutes.map(
          (route) =>
            characters.map((character) =>
              buildUrlTemplate({
                loc: `${character.Gw2ApiToken.User.alias}/c/${character.name}${route.loc}`,
                priority: route.priority,
                updatedAt: character.updatedAt,
              }))
        ),
      ]));
  }

  return {
    generate,
  };
};
