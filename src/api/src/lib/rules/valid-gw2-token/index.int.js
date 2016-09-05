'use strict';

var token = require('./index');
var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');
var axios = require('axios');

describe('gw2 token validator', function () {
    var models;

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync().then(function () {
            done();
        });
    });
    
    it('should call real endpoint and resolve', function (done) {
        token('token', '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15', { 
            axios: axios,
            env: {
                gw2: {
                    endpoint: 'https://api.guildwars2.com/'
                }
            },
            models: models
        }).then(function (e) {
            expect(e).not.toBeDefined();
            done();
        }, function (e) {
            console.log(e);
        });
    }, 40000);

    it('should call real endpoint and resolve error', function (done) {
        token('token', 'invalid', { 
            axios: axios,
            env: {
                gw2: {
                    endpoint: 'https://api.guildwars2.com/'
                }
            },
            models: models
        }).then(function (e) {
            expect(e).toEqual({ 
                property: 'token', 
                message: 'invalid token' 
            });

            done();
        });
    }, 40000);
});