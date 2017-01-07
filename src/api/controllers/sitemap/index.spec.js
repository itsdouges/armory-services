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

async function init (models) {
  const user = await models.User.create({
    email: 'cool@email.com',
    passwordHash: 'password',
    alias: 'madou',
  });

  const token = {
    token: 'i-am-token',
    accountName: 'coolaccount.1234',
    permissions: 'abc,def',
    world: 'aus',
    accountId: 'i-am-id',
    UserId: user.id,
    primary: true,
  };

  const result = await models.Gw2ApiToken.create(token);

  const character = {
    name: 'madoubie',
    race: 'yolon',
    gender: 'male',
    profession: 'elementalist',
    level: '69',
    created: 'Sat Oct 24 2015 19:30:34',
    age: 1234,
    guild: 'a-guild',
    deaths: 0,
    Gw2ApiTokenToken: result.token,
  };

  const char = await models.Gw2Character.create(character);
  const guild = await models.Gw2Guild.create({
    id: 'hahah',
    name: 'cool guild',
    tag: 'yeah no',
  });
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

    return sitemap.generate()
      .then((actual) => {
        expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://gw2-local.com/</loc>
    <lastmod></lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/join</loc>
    <lastmod></lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/login</loc>
    <lastmod></lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/statistics</loc>
    <lastmod></lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/leaderboards</loc>
    <lastmod></lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/embeds</loc>
    <lastmod></lastmod>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/madou</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/characters</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/matches</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/guilds</loc>
    <lastmod>${userUpdated}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/cool guild</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/cool guild/users</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/cool guild/characters</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/g/cool guild/logs</loc>
    <lastmod>${guildUpdated}</lastmod>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/c/madoubie</loc>
    <lastmod>${characterUpdated}</lastmod>
    <priority>1.0</priority>
  </url>

</urlset>`);
      });
  });
});
