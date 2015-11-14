'use strict';

var fetchTokens = require('../../src/services/fetch-tokens');
var Models = require('../../src/models');

describe('fetch token service', function () {
	var models;

	beforeEach(function (done) {
		models = new Models(TestDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			done();
		});
	});

	it('should fetch valid tokens from the db', function (done) {
		seedData(models)
		.then(function (userId) {
			fetchTokens(models)
				.then(function (items) {
					expect(items[0].token).toBe('938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15');

					done();
				});
		});
	});
});