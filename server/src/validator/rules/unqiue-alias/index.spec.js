'use strict';

var uniqueAlias = require('./index');
var Models = require('../../../models');
var testDb = require('../../../../spec/helpers/db');

describe('unique email rule', function () {
	var models;

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync().then(function () {
			done();
		});
	});

	it('should resolve if alias is not found', function (done) {
		uniqueAlias('alias', {
			alias: 'alias'
		}, {
			models: models
		})
		.then(function () {
			done();
		});
	});

	it('should resolve if alias is unique', function (done) {
		uniqueAlias('alias', {
			alias: 'madou'
		}, {
			models: models
		})
		.then(function () {
			done();
		});
	});

	it('should resolve with error if alias is not unique', function (done) {
		models.User
		.create({
			alias: 'madou'
		})
		.then(function () {
			uniqueAlias('alias', {
				alias: 'madou'
			}, {
				models: models
			})
			.then(function (e) {
				expect(e.property).toBe('alias');
				expect(e.message).toBe('is taken');
				done();
			});
		});
	});
});