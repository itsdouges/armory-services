'use strict';

var uniqueEmail = require('./index');
var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');

describe('unique email rule', function () {
    var models;

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync().then(function () {
            done();
        });
    });

    it('should resolve if email is not found', function (done) {
        uniqueEmail('email', 'cool@email.com', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve if email is unique', function (done) {
        uniqueEmail('email', 'cool@email.com!!', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve with error if email is not unique', function (done) {
        models.User
        .create({
                email: 'cool@email.com',
                passwordHash: 'lolz',
                alias: 'swagn'
            })
        .then(function () {
            uniqueEmail('email', 'cool@email.com', {
                models: models
            })
            .then(function (e) {
                expect(e.property).toBe('email');
                expect(e.message).toBe('is taken');
                done();
            });
        });
    });
});