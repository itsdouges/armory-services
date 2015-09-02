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
			});
	});
});