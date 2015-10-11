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
		token('token', '14FE67AD-1780-F442-9BB0-CDB823F9EDACCDC70614-CB2F-4A09-A0C0-66F3BA3082CD', { 
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
	});
});