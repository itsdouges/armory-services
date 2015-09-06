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
		token('token', undefined)
			.then(function () {
				done();
			});
	});

	it('should resolve if token is valid', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', 'ee', { 
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

		token('token', 'ee', { 
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
						accountId: 'ahh',
						world: 'haha',
						UserId: e.id
					})
					.then(function (e) {
						token('token', 'ee', { 
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

	it('should resolve error if account id is already in db', function (done) {
		var tokenDefer = q.defer();
		var accountDefer = q.defer();

		mockAxios.get = function (endpoint) {
			if (endpoint === mockEnv.gw2.endpoint + 'v2/tokeninfo') {
				return tokenDefer.promise;
			}

			return accountDefer.promise;
		};

		spyOn(mockAxios, 'get').and.callThrough();

		models.User
			.create({
				email: 'email@email',
				passwordHash: 'lolz',
				alias: 'swagn'
			})
			.then(function (e) {
				models.Gw2ApiToken
					.create({
						token: 'hahahaha_token', 
						accountName: 'madou.1234', 
						accountId: 'ahh',
						world: 'yoloo',
						UserId: e.id
					})
					.then(function (e) {
						token('token', 'another_token_i_generated', { 
							axios: mockAxios,
							env: mockEnv,
							models: models
						}).then(function (e) {
							expect(e).toEqual({ 
								property: 'token', 
								message: 'key for madou.1234 already exists' 
							});

							done();
						});
					});
			});

		tokenDefer.resolve({
			data: {
				permissions: [
					'account',
					'characters',
					'inventories'
				]
			}
		});

		accountDefer.resolve({
			data: {
				id: 'ahh',
				name: 'madou.1234',
				world: 'yoloooo'
			}
		})
	});

	it('should resolve error if an error occurred during http', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', 'ee', { 
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
});