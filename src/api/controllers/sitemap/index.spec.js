import * as testData from 'test/testData';

const publicUrl = 'http://gw2-local.com';

const createSitemapController = proxyquire('api/controllers/sitemap', {
  config: {
    web: {
      publicUrl,
    },
  },
});

const getUpdatedAt = async (model) => {
  const data = await model.findOne();

  return data.updatedAt.toISOString();
};

const user = testData.user();
const apiToken = testData.apiToken();
const standing = testData.dbStanding();
const character = testData.character();
const guild = testData.guild();

async function init (models) {
  await models.User.create(user);
  await models.Gw2ApiToken.create(apiToken);
  await models.PvpStandings.create(standing);
  await models.Gw2Character.create(character);
  await models.Gw2Guild.create(guild);
}

describe('sitemap', () => {
  let sitemap;
  let models;

  beforeEach(async () => {
    models = await setupTestDb();
    await init(models);
    sitemap = createSitemapController(models);
  });

  it('should render user data', async () => {
    const userUpdated = await getUpdatedAt(models.User);
    const guildUpdated = await getUpdatedAt(models.Gw2Guild);
    const characterUpdated = await getUpdatedAt(models.Gw2Character);
    const standingsUpdated = await getUpdatedAt(models.PvpStandings);

    return sitemap.generate()
      .then((actual) => {
        expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://gw2-local.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/join</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/login</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/statistics</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/leaderboards</loc>
    <lastmod>${standingsUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/embeds</loc>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/characters</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/matches</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/guilds</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/${guild.name}</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/${guild.name}/users</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/${guild.name}/characters</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/${guild.name}/logs</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/c/${character.name}</loc>
    <lastmod>${characterUpdated}</lastmod>
    <priority>1.0</priority>
  </url>

</urlset>`);
      });
  });
});
