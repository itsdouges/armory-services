'use strict';

var q = require('q');
var axios = require('axios');
var Models = require('../../src/models');
var Controller = require('../../src/controllers/ping-controller');

var fetchGw2 = require('../../src/services/fetch-gw2');

describe('ping controller', function () {
	var models;
	var sut;

	beforeEach(function (done) {
		models = new Models(TestDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			sut = new Controller({
				gw2: {
					endpoint: 'https://api.guildwars2.com/'
				}
			}, axios, models, fetchGw2);
			done();
		});
	});

	it('should hit the characters endpoint for every valid token and add character data to db', function (done) {
		seedData(models)
			.then(function () {
				return sut.ping();
			})
			.then(function () {
				done();
			}, function (e) {
				console.log(e)
			});
	}, 40000);

	it('should be able to call gw2 api 1,000 times and resolve', function (done) {
		seedData(models)
			.then(function () {
				var tokens = [];

				for(var i = 0; i < 1000; i++) {
					tokens.push('938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15');
				}

				return sut.mapTokensAndCallApi(tokens);
			})
			.then(function () {
				done();
			}, function (e) {
				console.log(e)
			});
	}, 500000);
});