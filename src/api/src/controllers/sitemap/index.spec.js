const proxyquire = require('proxyquire');
const Models = require('../../models');

const publicUrl = 'http://gw2-local.com';

const createSitemapController = proxyquire('./', {
  '../../../config': {
    web: {
      publicUrl,
    },
  },
});

function init (models) {
  return models.User.create({
    email: 'cool@email.com',
    passwordHash: 'password',
    alias: 'madou',
  })
  .then((user) => {
    const token = {
      token: 'i-am-token',
      accountName: 'coolaccount.1234',
      permissions: 'abc,def',
      world: 'aus',
      accountId: 'i-am-id',
      UserId: user.id,
      primary: true,
    };

    return models.Gw2ApiToken.create(token)
      .then((result) => {
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

        return models.Gw2Character.create(character);
      });
  })
  .then(() =>
    models.Gw2Guild.create({
      id: 'hahah',
      name: 'cool guild',
      tag: 'yeah no',
    })
  );
}

describe('sitemap', () => {
  let sitemap;
  let models;

  beforeEach(() => {
    models = new Models(testDb());
    return models.sequelize.sync({
      force: true,
    })
    .then(() => init(models))
    .then(() => (sitemap = createSitemapController(models)));
  });

  it('should render user data', () => {
    return sitemap.generate()
      .then((actual) => {
        expect(actual).to.equal(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://gw2-local.com/</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/join</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/login</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/statistics</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/embeds</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/madou</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/characters</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/matches</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/g/cool guild</loc>
  </url>
  <url>
    <loc>http://gw2-local.com/madou/c/madoubie</loc>
  </url>

</urlset>`);
      });
  });
});
