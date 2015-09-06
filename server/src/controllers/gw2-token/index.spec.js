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

	var seedDb = function (email) {
		return models
			.User
			.create({
				email: email,
				passwordHash: 'lolz',
				alias: 'swagn'
			})
			.then(function (user) {
				return models
					.Gw2ApiToken
					.create({
						token: 'cool_token',
						accountName: 'madou.0',
						accountId: '12341234',
						world: 'australia',
						UserId: user.id
					}).then(function () {
						return models
							.Gw2ApiToken
							.create({
								token: 'another_token',
								accountName: 'madou.1',
								accountId: '4321431',
								world: 'iceland',
								UserId: user.id,
								valid: false
							});
					});
			});
	};

	describe('list', function () {
		it('should list tokens in db', function (done) {
			seedDb('email@email.com')
				.then(function () {
					systemUnderTest
						.list('email@email.com')
						.then(function (tokens) {
							expect(2).toBe(tokens.length);

							var token1 = tokens[0];
							var token2 = tokens[1];

							expect('cool_token').toBe(token1.token);
							expect('madou.0').toBe(token1.accountName);
							expect('australia').toBe(token1.world);
							expect(true).toBe(token1.valid);

							expect('another_token').toBe(token2.token);
							expect('madou.1').toBe(token2.accountName);
							expect('iceland').toBe(token2.world);
							expect(false).toBe(token2.valid);

							done();
						});
				});
		});
	});

	describe('adding', function () {
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
					world: 'cool-world'
				});
			});
		});
	});

	describe('removing', function () {
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
					world: 'cool-world'
				});
			});
		});
	});
});