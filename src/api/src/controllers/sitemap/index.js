const config = require('../../../env');

const buildUrlTemplate = (relativeUrl) =>
`    <url>
      <loc>
        ${config.web.publicUrl}/${relativeUrl}
      </loc>
    </url>`;

const publicRoutes = [
  'join',
  'login',
];

const buildSitemap = (users, guilds, characters) =>
`<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(buildUrlTemplate).join('\n')}
${users.join('\n')}
${guilds.join('\n')}
${characters.join('\n')}
  </sitemapindex>
</xml>`;


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

  function parseUserToXml (user) {
    return (buildUrlTemplate(user.alias));
  }

  function parseGuildToXml (guild) {
    return (buildUrlTemplate(`g/${guild.name}`));
  }

  function parseCharacterToXml (character) {
    return (buildUrlTemplate(`${character.Gw2ApiToken.User.alias}/c/${character.name}`));
  }

  function generate () {
    return getAllResources()
      .then(([users, guilds, characters]) => buildSitemap(
        users.map(parseUserToXml),
        guilds.map(parseGuildToXml),
        characters.map(parseCharacterToXml))
      );
  }

  return {
    generate,
  };
};
