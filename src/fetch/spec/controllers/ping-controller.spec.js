'use strict';

var q = require('q');
var mockery = require('mockery');

var Models = require('../../src/models');
var Controller = require('../../src/controllers/ping-controller');

describe('ping controller', function () {
    var models;
    var sut;
    var mockFetchGw2 = {};
    var mockAxios = {};
    var mockConfig = {};

    beforeEach(function (done) {
        mockFetchGw2.fetchCharacters = function () {};
        mockFetchGw2.guild = function () {};

        mockery.enable();
        mockery.registerMock('axios', mockAxios);
        mockery.registerMock('../../../env/env_config', mockConfig);

        models = new Models(TestDb());
        models.sequelize.sync({
            force: true
        }).then(function () {
            sut = new Controller({
                gw2: {
                    endpoint: 'api-tho'
                }
            }, {}, models, mockFetchGw2);
            done();
        });
    });

    it('should delete characters not brought back from the gw2 api', function (done) {
        spyOn(mockFetchGw2, 'fetchCharacters').andReturn(q.resolve([{
            name: 'character1',
            race: 'race',
            gender: 'gender',
            profession: 'profession',
            level: 69,
            created: '01/01/90',
            age: 20,
            deaths: 2,
            Gw2ApiTokenToken: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15'
        }]));

        seedData(models)
            .then(function () {
                return models.Gw2Character.findOne({
                    where: {
                        name: 'character'
                    }
                });
            })
            .then(function (character) {
                expect(character).toBeDefined();
            })
            .then(function () {
                return sut.fetchUserCharacterData('938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15');
            })
            .then(function () {
                expect(mockFetchGw2.fetchCharacters).toHaveBeenCalledWith('api-tho', '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15', mockAxios);

                return models.Gw2Character.findOne({
                    where: {
                        name: 'character'
                    }
                });
            })
            .then(function (character) {
                expect(character).toBe(null);
            })          
            .then(function () {
                return models.Gw2Character.findOne({
                    where: {
                        name: 'character1'
                    }
                });
            })
            .then(function (character) {
                expect(character).toBeDefined();
                done();
            });
    });

    it('should fetch guild data if guild isnt in db after character data', function (done) {
        mockConfig.gw2 = {
            endpoint: 'heh'
        };

        spyOn(mockFetchGw2, 'fetchCharacters').andReturn(q.resolve([{
            name: 'character1',
            race: 'race',
            gender: 'gender',
            profession: 'profession',
            level: 69,
            created: '01/01/90',
            age: 20,
            guild: 'cool-guild',
            deaths: 2
        }]));

        spyOn(mockFetchGw2, 'guild').andReturn(q.resolve({
            guild_id: 'cool-guild',
            guild_name: 'name',
            tag: 'tag'
        }));

        seedData(models)
            .then(function () {
                return sut.fetchUserCharacterData('938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15');
            })
            .then(function () {
                expect(mockFetchGw2.guild).toHaveBeenCalledWith('cool-guild');

                return models.Gw2Guild.findOne({
                    where: {
                        id: 'cool-guild'
                    }
                })
                .then(function (guild) {
                    expect(guild).toBeDefined();
                    expect(guild.id).toBe('cool-guild');
                    expect(guild.name).toBe('name');
                    expect(guild.tag).toBe('tag');
                });
            })
            .then(function () {
                return sut.fetchUserCharacterData('938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15');
            })
            .then(function () {
                expect(mockFetchGw2.guild.callCount).toBe(1);
                done();
            });
    });

    it('should ping gw2 character api for every token in db', function () {
        // todo !
    });
});