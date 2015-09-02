var Controller = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('gw2 token controller', function () {
	var systemUnderTest;
	var mockValidator;
	var mockGw2Api;

	var mocks = {
		validate: function () {}
	};

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			done();
		});

		mockGw2Api = {
			readAccount: function () {}
		};

		mockValidator = function () {
			return {
				validate: mocks.validate
			};
		};

		mockValidator.addResource = function () {};

		spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
		systemUnderTest = new Controller(models, mockValidator, mockGw2Api);
	});

	it('should add users resource in update-gw2-token mode to validator', function () {
		expect(mockValidator.addResource).toHaveBeenCalledWith({
			name: 'gw2-token',
			mode: 'add',
			rules: {
				token: ['valid-gw2-token', 'no-white-space']
			}
		});
	});

	it('should reject promise if validation fails', function (done) {
		var defer = q.defer();

		spyOn(mocks, 'validate').and.returnValue(defer.promise);

		systemUnderTest
			.add('1234', 'token')
			.then(null, function (e) {
				expect(mocks.validate).toHaveBeenCalledWith({
					token: 'token'
				});
				
				expect(e).toBe('failed');

				done();
			});

		defer.reject('failed');
	});

	it('should add token to db if validation succeeds', function (done) {
		var defer = q.defer();
		var accountDefer = q.defer();

		spyOn(mocks, 'validate').and.returnValue(defer.promise);
		spyOn(mockGw2Api, 'readAccount').and.returnValue(accountDefer.promise);

		models
			.User
			.create({
				email: 'cool@email.com',
				passwordHash: 'lolz',
				alias: 'swagn'
			})
			.then(function (e) {
				systemUnderTest
					.add('cool@email.com', 'token')
					.then(function (res) {
						expect(res).toBe(undefined);

						models
							.Gw2ApiToken
							.findOne({
								where: {
									token: 'token'
								}
							}).then(function (result) {
								expect(result.token).toBe('token');
								expect(result.UserId).toBe(e.id);
								expect(result.accountName).toBe('nameee');
								expect(result.accountId).toBe('eeee');
								
								done();
							});
					});

			defer.resolve();

			accountDefer.resolve({
				name: 'nameee',
				id: 'eeee',
			});
		});
	});

	// todo: omg this is so dirty clean it up later.. lol
	it('should remove token from db', function (done) {
		var defer = q.defer();
		var accountDefer = q.defer();

		spyOn(mocks, 'validate').and.returnValue(defer.promise);
		spyOn(mockGw2Api, 'readAccount').and.returnValue(accountDefer.promise);

		models
			.User
			.create({
				email: 'cool@email.com',
				passwordHash: 'lolz',
				alias: 'swagn'
			})
			.then(function (e) {
				systemUnderTest
					.add('cool@email.com', 'token')
					.then(function (res) {
						expect(res).toBe(undefined);

						models
							.Gw2ApiToken
							.findOne({
								where: {
									token: 'token'
								}
							}).then(function (result) {
								expect(result.token).toBe('token');
								expect(result.UserId).toBe(e.id);
								expect(result.accountName).toBe('nameee');
								expect(result.accountId).toBe('aaaa');

								systemUnderTest
									.remove('cool@email.com', 'token')
									.then(function (rez) {
										expect(rez).toBe(1);

										models
											.Gw2ApiToken
											.findOne({
												where: {
													token: 'token'
												}
											}).then(function (result) {
												expect(result).toBe(null);
												done();
											});
									});
							});
					});

			defer.resolve();

			accountDefer.resolve({
				name: 'nameee',
				id: 'aaaa',
			});
		});
	});
});