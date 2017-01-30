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
  loc: 'leaderboards/pvp',
  priority: '0.9',
}, {
  loc: 'leaderboards/pvp/na',
  priority: '0.9',
}, {
  loc: 'leaderboards/pvp/eu',
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

const buildUrlTemplate = ({ loc, updatedAt, priority }: BuildUrlTemplateOptions) => {
  const tags = [
    `<loc>${config.web.publicUrl}/${loc}</loc>`,
    updatedAt && `<lastmod>${updatedAt.toISOString()}</lastmod>`,
    priority && `<priority>${priority}</priority>`,
  ].filter((tag) => tag);

  return `  <url>
    ${tags.join('\n    ')}
  </url>`;
};

const buildSitemap = (publicUpdatedMap, items) =>
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map((route) => buildUrlTemplate({
  ...route,
  // $FlowFixMe
  updatedAt: publicUpdatedMap[route.loc],
})).join('\n')}
${items.reduce((str, item) => {
  // eslint-disable-next-line no-param-reassign
  str += `${item.join('\n')}\n`;
  return str;
}, '')}
</urlset>`;

export default function sitemapControllerFactory (models: Models) {
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
      models.PvpStandings.findOne(),
    ]);
  }

  async function generate () {
    const [users, guilds, characters, standing] = await getAllResources();

    const publicUpdatedMap = {
      'leaderboards/pvp': standing.updatedAt,
      'leaderboards/pvp/na': standing.updatedAt,
      'leaderboards/pvp/eu': standing.updatedAt,
    };

    return buildSitemap(publicUpdatedMap, [
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
    ]);
  }

  return {
    generate,
  };
}
