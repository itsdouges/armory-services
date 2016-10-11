const controllerFactory = require('./index');
const Models = require('../../models');

describe.only('character controller', () => {
  let controller;
  let mockGw2Api;
  let models;

  beforeEach(() => {
    models = new Models(testDb());
    return models.sequelize.sync({
      force: true,
    })
    .then(() => {
      mockGw2Api = {
        readCharacter () {},
      };

      controller = controllerFactory(models, mockGw2Api);
    });
  });

  it('should reject if character name is not in our db', (done) => {
    controller.read('noname').then(null, done);
  });

  it('should reject if email doesnt match', (done) => {
    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
          .User
          .findOne({
            where: {
              email: 'cool@email',
            },
          });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', true, 'notcool@email');
      })
      .then(null, done);
  });

  // the orchestration to get this unit test running is a bit crazy..
  // dont really want to mock out the db though. no point when we can
  // test in memory. ill think about it.
  it('should call gw2api if it is in our db', (done) => {
    sinon.stub(mockGw2Api, 'readCharacter').returns(Promise.resolve({}));

    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
            .User
            .findOne({
              where: {
                email: 'cool@email',
              },
            });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Guild
          .create({
            name: 'Guild Name',
            id: 'guild',
            tag: '[tag]',
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            guild: 'guild',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', true, 'cool@email');
      })
      .then((data) => {
        expect(data).to.eql({
          authorization: {
            showPublic: true,
            showGuild: true,
          },
          accountName: 'nameyname',
          guild_tag: '[tag]',
          guild_name: 'Guild Name',
          alias: 'madou',
        });

        expect(mockGw2Api.readCharacter).to.have.been.calledWith('blastrn', {
          token: 'swag',
          showBags: true,
          showCrafting: true,
          showEquipment: true,
          showBuilds: true,
        });

        done();
      });
  });

  it('should call api with show all', (done) => {
    sinon.stub(mockGw2Api, 'readCharacter').returns(Promise.resolve({}));

    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
          .User
          .findOne({
            where: {
              email: 'cool@email',
            },
          });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', false);
      })
      .then((data) => {
        expect(data).to.eql({
          authorization: {
            showPublic: true,
            showGuild: true,
          },
          accountName: 'nameyname',
          alias: 'madou',
        });

        expect(mockGw2Api.readCharacter).to.have.been.calledWith('blastrn', {
          token: 'swag',
          showBags: true,
          showCrafting: true,
          showEquipment: true,
          showBuilds: true,
        });

        done();
      });
  });

  const setupTestData = ({ email, characterName } = {}) => {
    return models
        .User
        .create({
          email: email || 'cool@email',
          passwordHash: 'coolpassword',
          alias: 'madou',
        })
        .then(() => {
          return models
            .User
            .findOne({
              where: {
                email: email || 'cool@email',
              },
            });
        })
        .then((data) => {
          return models
            .Gw2ApiToken
            .create({
              token: 'swag',
              accountName: 'nameyname',
              accountId: 'aaaa',
              permissions: 'cool,permissions',
              world: 1111,
              UserId: data.id,
            });
        })
        .then(() => {
          return models
            .Gw2Character
            .create({
              Gw2ApiTokenToken: 'swag',
              name: characterName || 'blastrn',
              gender: 'Female',
              profession: 'hehe',
              level: 123,
              created: new Date(),
              age: 1,
              guild: 'guild',
              race: 'ay',
              deaths: 1,
            });
        })
        .then(() => {
          return models
            .Gw2Guild
            .create({
              name: 'Guild Name',
              id: 'guild',
              tag: '[tag]',
            });
        })
        .then(() => {
          return models
            .Gw2Character
            .create({
              Gw2ApiTokenToken: 'swag',
              name: 'ayyyyy',
              gender: 'Female',
              profession: 'heehe',
              level: 1,
              created: new Date(),
              age: 1,
              race: 'ayay',
              deaths: 1,
            });
        })
        .then(() => {
          return models
            .Gw2Character
            .create({
              Gw2ApiTokenToken: 'swag',
              name: 'CoolCharacter',
              gender: 'Male',
              profession: 'Necromancer',
              level: 1,
              created: new Date(),
              age: 1,
              showPublic: false,
              race: 'ayay',
              deaths: 1,
            });
        });
  };

  describe('character lists', () => {
    context('when ignoring privacy', () => {
      it('should return all characters by email', () => {
        return setupTestData()
          .then(() => {
            controller.list({ email: 'cool@email', ignorePrivacy: true })
              .then((list) => {
                expect(list.length).to.equal(3);
              });
          });
      });

      it('should return all characters by alias', () => {
        return setupTestData()
          .then(() => {
            controller.list({ alias: 'madou', ignorePrivacy: true })
              .then((list) => {
                expect(list.length).to.equal(3);
              });
          });
      });
    });

    context('when privacy is on', () => {
      it('should return all characters by email', () => {
        return setupTestData()
          .then(() => {
            controller.list({ email: 'cool@email' })
              .then((list) => {
                expect(list.length).to.equal(2);

                const [charOne, charTwo] = list;

                expect(charOne).to.eql({
                  accountName: 'nameyname',
                  world: 1111,
                  name: 'blastrn',
                  gender: 'Female',
                  profession: 'hehe',
                  level: 123,
                  race: 'ay',
                });

                expect(charTwo).to.eql({
                  accountName: 'nameyname',
                  world: 1111,
                  name: 'ayyyyy',
                  gender: 'Female',
                  profession: 'heehe',
                  level: 1,
                  race: 'ayay',
                });
              });
          });
      });

      it('should return all characters by alias', () => {
        return setupTestData()
          .then(() => {
            controller.list({ alias: 'madou' })
              .then((list) => {
                expect(list.length).to.equal(2);

                const [charOne, charTwo] = list;

                expect(charOne).to.eql({
                  accountName: 'nameyname',
                  world: 1111,
                  name: 'blastrn',
                  gender: 'Female',
                  profession: 'hehe',
                  level: 123,
                  race: 'ay',
                });

                expect(charTwo).to.eql({
                  accountName: 'nameyname',
                  world: 1111,
                  name: 'ayyyyy',
                  gender: 'Female',
                  profession: 'heehe',
                  level: 1,
                  race: 'ayay',
                });
              });
          });
      });
    });
  });

  describe('reading random character name', () => {
    it('should return a character name', () => {
      const expectedNames = ['blastrn', 'ayyyyy'];

      return setupTestData()
        .then(controller.random)
        .then((name) => expect(expectedNames).to.contain(name));
    });
  });

  describe('updating character', () => {
    it('should reject if character doesnt belong to email', () => {
      const email = 'email@email.com';
      const characterName = 'Blastrn';

      return setupTestData({ email, characterName })
        .then(() => controller.update('bad-email', { name: characterName }))
        .then(null, (e) => expect(e).to.eql('Not your character'));
    });

    it('should resolve and update if character belongs to email', (done) => {
      const email = 'email@email.com';
      const characterName = 'Blastrn';

      setupTestData({ email, characterName })
        .then(() => controller.update(email, {
          name: characterName,
          showPublic: false,
          showBuilds: false,
          showPvp: false,
          showBags: false,
          showGuild: false,
        }))
        .then(() => {
          return models.Gw2Character.findOne({ where: { name: characterName } });
        })
        .then((character) => {
          expect(character.dataValues).to.include({
            showPublic: false,
            showBuilds: false,
            showPvp: false,
            showBags: false,
            showGuild: false,
          });
        })
        .then(done);
    });
  });
});
