var q = require('q');

var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');
var Controller = require('./index');

describe('search controller', function () {
    var models;
    var systemUnderTest;

    function seed () {
        return models.User.create({
            alias: 'madou',
            email: 'laheen@gmail.com',
            passwordHash: 'okreally'
        })
        .then(function (user) {
            return models.Gw2ApiToken.create({
                token: 'A-TOKEN!!',
                accountName: 'accName',
                permissions: 'stuff',
                world: 'hah',
                accountId: 'idid',
                UserId: user.id,
                primary: true,
            });
        })
        .then(function (token) {
            return models.Gw2Character.create({
                name: 'aaamadouuuu',
                race: 'girl',
                gender: 'M',
                profession: 'carpenter',
                level: 1,
                created: new Date(),
                age: 1,
                deaths: 0,
                Gw2ApiTokenToken: token.token
            })
        })
        .then(function () {
            return models.Gw2Guild.create({
                name: 'guildOfMadou',
                id: 'guild-swag',
                tag: 'heytag'
            })
        });
    }

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync({
            force: true
        }).then(function () {
            done();
        });

        systemUnderTest = Controller(models);
    });

    describe('simple', function () {
        it('should return any resource that is like the search term', function (done) {
            seed().then(function () {
                systemUnderTest.search('ado')
                    .then(function (results) {
                        expect(results).toEqual([{
                            resource: 'users',
                            name: 'madou',
                            accountName: 'accName',
                        }, {
                            resource: 'characters',
                            name: 'aaamadouuuu',
                            accountName: 'accName',
                            alias: 'madou',
                            level: 1,
                            profession: 'carpenter',
                            race: 'girl'
                        }, {
                            resource: 'guilds',
                            name: 'guildOfMadou',
                            tag: 'heytag'
                        }]);

                        done();
                    });
                });
        });
    });
});
