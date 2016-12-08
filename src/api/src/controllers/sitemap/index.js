const config = require('../../../config');

const buildUrlTemplate = (relativeUrl) =>
`  <url>
    <loc>${config.web.publicUrl}/${relativeUrl}</loc>
  </url>`;

const publicRoutes = [
  '',
  'join',
  'login',
  'statistics',
  'embeds',
];

const buildSitemap = (...items) =>
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(buildUrlTemplate).join('\n')}
${items.reduce((str, item) => {
  // eslint-disable-next-line no-param-reassign
  str += `${item.join('\n')}\n`;
  return str;
}, '')}
</urlset>`;

const userRoutes = ['', '/characters', '/matches', '/guilds'];

module.exports = function sitemapControllerFactory (models) {
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
      .then(([users, guilds, characters]) => buildSitemap(
        ...userRoutes.map(
          (route) => users.map((user) => buildUrlTemplate(`${user.alias}${route}`))
        ),
        guilds.map((guild) => buildUrlTemplate(`g/${guild.name}`)),
        characters.map(
          (character) =>
            buildUrlTemplate(`${character.Gw2ApiToken.User.alias}/c/${character.name}`))
        )
      );
  }

  return {
    generate,
  };
};
