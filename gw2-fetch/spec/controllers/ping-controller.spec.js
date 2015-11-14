'use strict';

var q = require('q');

var Models = require('../../src/models');
var Controller = require('../../src/controllers/ping-controller');

var mockFetchGw2 = {};

describe('ping controller', function () {
	var models;
	var sut;

	beforeEach(function (done) {
		mockFetchGw2.fetchCharacters = function () {};

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
});