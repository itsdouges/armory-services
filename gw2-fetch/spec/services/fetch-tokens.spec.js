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
					expect(items[0].token).toBe('0C87E308-4B55-1E46-B381-9F29AE49E2128FCA9D47-A3A9-496E-AED0-D531E3BDB25C');
					expect(items[1].token).toBe('25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B');
					expect(items[2].token).toBe('70EC1A3F-5EF3-3C46-B367-79248F7C8DD241FB192B-DA7E-499D-8A54-8675470F1F71');
					expect(items.length).toBe(3);

					done();
				});
		});
	});
});