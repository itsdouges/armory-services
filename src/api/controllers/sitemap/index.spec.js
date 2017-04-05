import * as testData from 'test/testData/db';

const publicUrl = 'http://gw2-local.com';
const apiPublicUrl = 'http://api.gw2.com';

const date = new Date();
const createSitemapController = proxyquire('api/controllers/sitemap', {
  config: {
    web: {
      publicUrl,
    },
    api: {
      publicUrl: apiPublicUrl,
    },
    sitemap: {
      pageItemLimit: 7,
    },
  },
  moment: () => date,
});

const getUpdatedAt = async (model) => {
  const data = await model.findOne();

  return data.updatedAt.toISOString();
};

const user = testData.user();
const apiToken = testData.apiToken();
const standing = testData.standing();
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
  let userUpdated;
  let guildUpdated;
  let characterUpdated;
  let standingsUpdated;

  beforeEach(async () => {
    models = await setupTestDb();
    await init(models);

    [userUpdated, guildUpdated, characterUpdated, standingsUpdated] = await Promise.all([
      getUpdatedAt(models.User),
      getUpdatedAt(models.Gw2Guild),
      getUpdatedAt(models.Gw2Character),
      getUpdatedAt(models.PvpStandings),
    ]);

    sitemap = createSitemapController(models);
  });

  it('should render index', async () => {
    const index = await sitemap.index();

    expect(index).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>http://api.gw2.com/sitemap0.xml</loc>
    <lastmod>${date.toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>http://api.gw2.com/sitemap1.xml</loc>
    <lastmod>${date.toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>http://api.gw2.com/sitemap2.xml</loc>
    <lastmod>${date.toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`
);
  });

  it('should render render page one', async () => {
    const actual = await sitemap.generate(0);

    expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://gw2-local.com/</loc>
    <priority>1.0</priority>
    <changefreq>always</changefreq>
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
    <loc>http://gw2-local.com/leaderboards/pvp</loc>
    <lastmod>${standingsUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/leaderboards/pvp/na</loc>
    <lastmod>${standingsUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/leaderboards/pvp/eu</loc>
    <lastmod>${standingsUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`);
  });

  it('should render render page two', async () => {
    const actual = await sitemap.generate(1);

    expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
</urlset>`);
  });

  it('should render render page three', async () => {
    const actual = await sitemap.generate(2);

    expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
  <url>
    <loc>http://gw2-local.com/${user.alias}/c/${character.name}/pvp</loc>
    <lastmod>${characterUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/c/${character.name}/wvw</loc>
    <lastmod>${characterUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/${user.alias}/c/${character.name}/bags</loc>
    <lastmod>${characterUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`);
  });
});
