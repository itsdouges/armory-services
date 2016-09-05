var q = require('q');

var controller = require('./index');
var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');

describe('guild controller', function () {
    var sut;
    var models;

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync({
            force: true
        }).then(function () {
            done();
        });

        sut = controller(models);
    });

    function setupTestData () {
        return models
            .User
            .create({
                email: 'cool@email.com',
                passwordHash: 'realhashseriously',
                alias: 'huedwell'
            })
            .then(function (user) {
                userId = user.id;

                return models
                    .Gw2ApiToken
                    .create({
                        token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
                        accountName: 'cool.4321',
                        accountId: 'haha_id',
                        permissions: 'cool,permissions',
                        world: 1234,
                        UserId: userId
                    });
            })
            .then(function (token) {
                return models
                    .Gw2Character
                    .create({
                        name: 'character',
                        race: 'race',
                        gender: 'gender',
                        profession: 'profession',
                        level: 69,
                        created: '01/01/90',
                        age: 20,
                        deaths: 2,
                        guild: 'im-guild',
                        Gw2ApiTokenToken: token.token
                    })
                    .then(function () {
                        return models
                            .Gw2Character
                            .create({
                                name: 'character!',
                                race: 'race',
                                gender: 'gender',
                                profession: 'profession',
                                level: 69,
                                created: '01/01/90',
                                age: 20,
                                deaths: 2,
                                guild: 'im-guild',
                                Gw2ApiTokenToken: token.token
                            });
                    });
            })
            .then(function () {
                return models
                    .Gw2Guild
                    .create({
                        id: 'im-guild',
                        tag: 'tag',
                        name: 'name'
                    });
            });
    }

    it('should return guild and all associated characters', function (done) {
        setupTestData()
            .then(function () {
                return sut.read('name')
            })
            .then(function (guild) {
                expect(guild).toEqual({ 
                    name: 'name', 
                    id: 'im-guild', 
                    tag: 'tag', 
                    characters: [{ 
                            accountName: 'cool.4321', 
                            world: 'world', 
                            name: 'character', 
                            gender: 'gender', 
                            profession: 'profession', 
                            level: 69, 
                            race: 'race',
                            userAlias: 'huedwell' 
                        },
                        { 
                            accountName: 'cool.4321', 
                            world: 'world', 
                            name: 'character!', 
                            gender: 'gender', 
                            profession: 'profession', 
                            level: 69, 
                            race: 'race',
                            userAlias: 'huedwell'
                        }
                    ]
                });

                done();
            });
    });
});