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
		token('token', { token: '3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A' }, { 
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
		});
	});

	it('should call real endpoint and resolve error', function (done) {
		token('token', { token: 'invalid' }, { 
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
	});
});