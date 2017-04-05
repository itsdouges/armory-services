// @flow

import type { Models } from 'flowTypes';
import config from 'config';
import moment from 'moment';

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
}, {
  loc: '/pvp',
  priority: '0.9',
}, {
  loc: '/wvw',
  priority: '0.9',
}, {
  loc: '/bags',
  priority: '0.9',
}];

const publicRoutes = [{
  loc: '',
  priority: '1.0',
  changefreq: 'always',
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

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
type BuildUrlTemplateOptions = {
  loc: string,
  priority: string,
  updatedAt?: Date,
  changefreq?: ChangeFrequency,
};

const buildUrlTemplate = ({ loc, updatedAt, priority, changefreq }: BuildUrlTemplateOptions) => {
  const tags = [
    `<loc>${config.web.publicUrl}/${encodeURI(loc)}</loc>`,
    updatedAt && `<lastmod>${updatedAt.toISOString()}</lastmod>`,
    priority && `<priority>${priority}</priority>`,
    changefreq && `<changefreq>${changefreq}</changefreq>`,
  ].filter((tag) => tag);

  return `  <url>
    ${tags.join('\n    ')}
  </url>`;
};

const buildSitemap = (items) =>
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</urlset>`;

const buildSitemapData = (users, guilds, characters, publicUpdatedAtMap) => {
  return [].concat(
    publicRoutes.map((route) => buildUrlTemplate({
      ...route,
      // $FlowFixMe
      updatedAt: publicUpdatedAtMap[route.loc],
    })),
    userRoutes.map(
      (route) => users.map((user) => buildUrlTemplate({
        loc: `${user.alias}${route.loc}`,
        priority: route.priority,
        updatedAt: user.updatedAt,
      }))
    ),
    guildRoutes.map(
      (route) => guilds.map((guild) => buildUrlTemplate({
        loc: `g/${guild.name}${route.loc}`,
        priority: route.priority,
        updatedAt: guild.updatedAt,
      }))
    ),
    characterRoutes.map(
      (route) =>
        characters.map((character) =>
          buildUrlTemplate({
            loc: `${character.Gw2ApiToken.User.alias}/c/${character.name}${route.loc}`,
            priority: route.priority,
            updatedAt: character.updatedAt,
          }))
    ),
  )
  .reduce((acc, items) => acc.concat(items), []);
};

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

  async function generate (page?: number = 0) {
    const [users, guilds, characters, standing] = await getAllResources();

    const publicUpdatedAtMap = {
      'leaderboards/pvp': standing.updatedAt,
      'leaderboards/pvp/na': standing.updatedAt,
      'leaderboards/pvp/eu': standing.updatedAt,
    };

    const offset = page * config.sitemap.pageItemLimit;
    const limit = offset + config.sitemap.pageItemLimit;

    const sitemapData = await buildSitemapData(users, guilds, characters, publicUpdatedAtMap);
    const slicedData = sitemapData.slice(offset, limit);

    return buildSitemap(slicedData);
  }

  async function index () {
    const [users, guilds, characters] = await getAllResources();
    const sitemapData = await buildSitemapData(users, guilds, characters, {});
    const urlCount = sitemapData.length;

    const pages = Math.ceil(urlCount / config.sitemap.pageItemLimit);
    const sitemaps = [];

    for (let i = 0; i < pages; i++) {
      sitemaps.push(`  <sitemap>
    <loc>${config.api.publicUrl}/sitemap${i}.xml</loc>
    <lastmod>${moment().toISOString()}</lastmod>
  </sitemap>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`;
  }

  return {
    generate,
    index,
  };
}
