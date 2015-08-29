'use strict';

var token = require('./index');
var q = require('q');

var axios = require('axios');

var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');

describe('gw2 token validator', function () {
	var mockAxios;
	var mockEnv;
	var models;

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync().then(function () {
			done();
		});
	});

	beforeEach(function () {
		mockAxios = {
			get: function () {}
		};

		mockEnv = {
			gw2: {
				endpoint: 'gw2.com/'
			}
		}
	});

	it('should resolve if item isnt found in object', function (done) {
		token('token', {})
			.then(function () {
				done();
			});
	});

	it('should resolve if token is valid', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv,
			models: models
		}).then(function (e) {
			expect(e).not.toBeDefined();
			expect(mockAxios.get).toHaveBeenCalledWith('gw2.com/v2/tokeninfo', {
				headers: {
					'Authorization' : 'Bearer ee'
				}
			});

			done();
		});

		defer.resolve({
			data: {
				permissions: [
					'account',
					'characters',
					'inventories'
				]
			}
		});
	});

	it('should resolve error if token doesnt have characters permission', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv,
			models: models
		}).then(function (e) {
			expect(e).toEqual({ 
				property: 'token', 
				message: 'needs characters and inventories permission' 
			});

			done();
		});

		defer.resolve({
			data: {
				permissions: [
					'account'
				]
			}
		});
	});

	it('should resolve error if token is already taken', function (done) {
		models.User
			.create({
				email: 'email@email',
				passwordHash: 'lolz',
				alias: 'swagn'
			})
			.then(function (e) {
				models.Gw2ApiToken
					.create({
						token: 'ee', 
						accountName: 'madou.1234', 
						UserId: e.id
					})
					.then(function (e) {
						token('token', { token: 'ee' }, { 
							axios: mockAxios,
							env: mockEnv,
							models: models
						}).then(function (e) {
							expect(e).toEqual({ 
								property: 'token', 
								message: 'is already being used' 
							});

							done();
						});
					});
			});
	});

	it('should resolve error if an error occurred during http', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv,
			models: models
		}).then(function (e) {
			expect(e).toEqual({ 
				property: 'token', 
				message: 'invalid token' 
			});

			done();
		});

		defer.reject();
	});

	// // todo: move to integration tests. they take too long for usual dev.
	// it('should call real endpoint and resolve', function (done) {
	// 	token('token', { token: '3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A' }, { 
	// 		axios: axios,
	// 		env: {
	// 			gw2: {
	// 				endpoint: 'https://api.guildwars2.com/'
	// 			}
	// 		},
	// 		models: models
	// 	}).then(function (e) {
	// 		expect(e).not.toBeDefined();
	// 		done();
	// 	});
	// });

	// // todo: move to integration tests. they take too long for usual dev.
	// it('should call real endpoint and resolve error', function (done) {
	// 	token('token', { token: 'invalid' }, { 
	// 		axios: axios,
	// 		env: {
	// 			gw2: {
	// 				endpoint: 'https://api.guildwars2.com/'
	// 			}
	// 		},
	// 		models: models
	// 	}).then(function (e) {
	// 		expect(e).toEqual({ 
	// 			property: 'token', 
	// 			message: 'invalid token' 
	// 		});

	// 		done();
	// 	});
	// });
});