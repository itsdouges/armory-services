var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');
var mockery = require('mockery');

describe('gw2 token controller', function () {
    var systemUnderTest;
    var mockValidator;
    var mockGw2Api;

    var mocks = {
        validate: function () {}
    };

    var mockConfig = {
        ping: {
            host: 'host',
            port: 'port'
        }
    };

    var mockAxios = {
        post: function () {}
    };

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync({
            force: true
        }).then(function () {
            done();
        });

        mockery.enable();
        mockery.registerMock('axios', mockAxios);
        mockery.registerMock('../../../env/env_config', mockConfig);
        mockGw2Api = {
            readTokenInfoWithAccount: function () {}
        };

        mockValidator = function () {
            return {
                validate: mocks.validate
            };
        };

        mockValidator.addResource = function () {};

        spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);

        var Controller = require('./index');
        systemUnderTest = new Controller(models, mockValidator, mockGw2Api);
    });

    afterEach(function () {
        mockery.disable();
    });

    var seedDb = function (email, addTokens) {
        if (addTokens === undefined) {
            addTokens = true;
        }

        return models
            .User
            .create({
                email: email,
                passwordHash: 'lolz',
                alias: 'swagn'
            })
            .then(function (user) {
                if (!addTokens) {
                    return user.id;
                }

                return models
                    .Gw2ApiToken
                    .create({
                        token: 'cool_token',
                        accountName: 'madou.0',
                        permissions: 'he,he',
                        accountId: '12341234',
                        world: 1234,
                        UserId: user.id
                    })
                    .then(function () {
                        return models
                            .Gw2ApiToken
                            .create({
                                token: 'another_token',
                                accountName: 'madou.1',
                                permissions: 'he,he',
                                accountId: '4321431',
                                world: 4321,
                                UserId: user.id,
                            });
                    })
                    .then(function () {
                        return user.id;
                    });
            });
    };

    describe('list', function () {
        it('should list tokens in db', function (done) {
            seedDb('email@email.com')
                .then(function () {
                    systemUnderTest
                        .list('email@email.com')
                        .then(function (tokens) {
                            expect(2).toBe(tokens.length);

                            var token1 = tokens[0];
                            var token2 = tokens[1];

                            expect('cool_token').toBe(token1.token);
                            expect('madou.0').toBe(token1.accountName);
                            expect(1234).toBe(token1.world);
                            expect(false).toBe(token1.primary);

                            expect('another_token').toBe(token2.token);
                            expect('madou.1').toBe(token2.accountName);
                            expect(4321).toBe(token2.world);
                            expect(false).toBe(token2.primary);

                            done();
                        });
                });
        });
    });

    describe('adding', function () {
        it('should add users resource in update-gw2-token mode to validator', function () {
            expect(mockValidator.addResource).toHaveBeenCalledWith({
                name: 'gw2-token',
                mode: 'add',
                rules: {
                    token: ['valid-gw2-token', 'no-white-space']
                }
            });
        });

        it('should reject promise if validation fails', function (done) {
            var defer = q.defer();

            spyOn(mocks, 'validate').and.returnValue(defer.promise);

            systemUnderTest
                .add('1234', 'token')
                .then(null, function (e) {
                    expect(mocks.validate).toHaveBeenCalledWith({
                        token: 'token'
                    });
                    
                    expect(e).toBe('failed');

                    done();
                });

            defer.reject('failed');
        });

        it('should return true if user has tokens', function (done) {
            seedDb('email@email.com')
                .then(function (id) {
                    return systemUnderTest.doesUserHaveTokens(id);
                })
                .then(function (result) {
                    expect(result).toBe(true);
                    done();
                });
        });

        it('should return false if user has no tokens', function (done) {
            seedDb('email@stuff.com', false)
                .then(function (id) {
                    return systemUnderTest.doesUserHaveTokens(id);
                })
                .then(function (result) {
                    expect(result).toBe(false);
                    done();
                });
        });

        it('should add token to db as not primary', function (done) {
            var defer = q.defer();
            var accountDefer = q.defer();

            spyOn(mocks, 'validate').and.returnValue(defer.promise);
            spyOn(mockGw2Api, 'readTokenInfoWithAccount').and.returnValue(accountDefer.promise);
            spyOn(mockAxios, 'post').and.returnValue(q.resolve());

            seedDb('cool@email.com')
                .then(function (e) {
                    systemUnderTest
                        .add('cool@email.com', 'token')
                        .then(function (result) {
                            expect(result.primary).toBe(false);
                            done();
                        });

                defer.resolve();

                accountDefer.resolve({
                    accountName: 'nameee',
                    accountId: 'eeee',
                    world: 1122,
                    info: ['cool', 'yeah!']
                });
            });
        });

        it('should add token to db as primary if first token', function (done) {
            var defer = q.defer();
            var accountDefer = q.defer();

            spyOn(mocks, 'validate').and.returnValue(defer.promise);
            spyOn(mockGw2Api, 'readTokenInfoWithAccount').and.returnValue(accountDefer.promise);
            spyOn(mockAxios, 'post').and.returnValue(q.resolve());

            models
                .User
                .create({
                    email: 'cool@email.com',
                    passwordHash: 'lolz',
                    alias: 'swagn'
                }) 
                .then(function (e) {
                    systemUnderTest
                        .add('cool@email.com', 'token')
                        .then(function (result) {
                            expect(result.token).toBe('token');
                            expect(result.primary).toBe(true);
                            expect(result.permissions).toBe('cool,yeah!');
                            expect(result.accountName).toBe('nameee');

                            expect(mockAxios.post).toHaveBeenCalledWith('http://host:port/fetch-characters', {
                                token: 'token'
                            });

                            done();
                        });

                defer.resolve();

                accountDefer.resolve({
                    accountName: 'nameee',
                    accountId: 'eeee',
                    world: 1122,
                    info: ['cool', 'yeah!']
                });
            });
        });
    });

    describe('primary', function () {
        it('should set all tokens primary to false except for target', function (done) {
            seedDb('email@email.com')
                .then(function () {
                    return systemUnderTest.selectPrimary('email@email.com', 'another_token');
                })
                .then(function (data) {
                    expect(data).toEqual([1]);
                })
                .then(function () {
                    return models
                        .Gw2ApiToken
                        .findAll();
                })
                .then(function (data) {
                    data.forEach(function (token) {
                        if (token.token === 'another_token') {
                            expect(token.primary).toBe(true);
                        } else {
                            expect(token.primary).toBe(false);
                        }
                    });

                    done();
                });
        });
    });

    describe('removing', function () {
        // todo: omg this is so dirty clean it up later.. lol
        it('should remove token from db', function (done) {
            var defer = q.defer();
            var accountDefer = q.defer();

            spyOn(mocks, 'validate').and.returnValue(defer.promise);
            spyOn(mockGw2Api, 'readTokenInfoWithAccount').and.returnValue(accountDefer.promise);
            spyOn(mockAxios, 'post').and.returnValue(q.resolve());

            models
                .User
                .create({
                    email: 'cool@email.com',
                    passwordHash: 'lolz',
                    alias: 'swagn'
                })
                .then(function (e) {
                    systemUnderTest
                        .add('cool@email.com', 'token')
                        .then(function (result) {
                            expect(result.token).toBe('token');
                            // expect(result.UserId).toBe(e.id);
                            expect(result.accountName).toBe('nameee');
                            // expect(result.accountId).toBe('eeee');

                            systemUnderTest
                                .remove('cool@email.com', 'token')
                                .then(function (rez) {
                                    expect(rez).toBe(1);

                                    models
                                        .Gw2ApiToken
                                        .findOne({
                                            where: {
                                                token: 'token'
                                            }
                                        }).then(function (result) {
                                            expect(result).toBe(null);
                                            done();
                                        });
                                });
                        });

                defer.resolve();

                accountDefer.resolve({
                    accountName: 'nameee',
                    accountId: 'eeee',
                    world: 1122,
                    info: ['cool', 'yeah!']
                });
            });
        });
    });
});