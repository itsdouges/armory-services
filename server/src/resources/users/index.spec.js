var UserResource = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('user resource', function () {
	var systemUnderTest;
	var models;

	var mocks = {
		validate: function () {},
		gw2Api: {
			readTokenAccountName: function () {}
		}
	};

	var mockValidator;

	function setupTestData(user, cb) {
		systemUnderTest
			.createUser(user)
			.then(function () {
				cb();
			});
	}

	beforeEach(function (done) {
		mockValidator = function () {
			return {
				validate: mocks.validate
			};
		};

		mockValidator.addResource = function () { };
		mockValidator.addRule = function () { };

		models = new Models(testDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			done();
		});

		spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
		spyOn(mockValidator, 'addRule').and.returnValue(mockValidator);
	});

	describe('initialisation', function () {
		it('should add users resource in create mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'create',
				rules: {
					email: ['required', 'unique-email', 'no-white-space'],
					password: ['required', 'password', 'no-white-space'],
					gw2_api_tokens: ['valid-gw2-token', 'no-white-space']
				}
			});
		});

		it('should add users resource in update mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update',
				rules: {
					password: ['required', 'password', 'no-white-space']
				}
			});
		});

		it('should add users resource in update-gw2-token mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update-gw2-token',
				rules: {
					gw2_api_tokens: ['valid-gw2-token', 'no-white-space']
				}
			});
		});
	});

	describe('creation', function () {
		it('should call validator and reject promise if validator returns errors', function (done) {
			var user = {};
			var defer = q.defer();
			var errors = ['im a error'];

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest = new UserResource(models, mockValidator);

			systemUnderTest
				.create(user)
				.then(null, function (e) {
					expect(e).toBe(errors);

					done();
				});

			defer.reject(errors);
		});

		it('should add user to database with expected values', function (done) {
			var user = {
				email: 'cool@email.com',
				password: 'password',
				gw2_api_tokens: [{
					token: 'haha'
				}, 
				{
					token: 'nahhman'
				}]
			};

			var defer = q.defer();
			var accountNameDefer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);
			spyOn(mocks.gw2Api, 'readTokenAccountName').and.returnValue(accountNameDefer.promise);

			systemUnderTest = new UserResource(models, mockValidator, mocks.gw2Api);
			systemUnderTest
				.create(user)
				.then(function () {
					models.User
						.findOne({ 
							where: {
								email: user.email 
							},
							include: [{
								all: true
							}]
						})
						.then(function (e) {
							expect(e.id).toBeDefined();
							expect(e.email).toBe(user.email);
							expect(e.gw2_api_tokens[0].token).toBe('haha');
							expect(e.gw2_api_tokens[0].accountName).toBe('cool name.1234');
							expect(e.gw2_api_tokens[0].UserId).toBe(e.id);
							expect(e.gw2_api_tokens[1].token).toBe('nahhman');
							expect(e.gw2_api_tokens[1].accountName).toBe('cool name.1234');
							expect(e.gw2_api_tokens[1].UserId).toBe(e.id);
							expect(e.passwordHash).toBeDefined();
							expect(e.emailValidated).toBe(false);

							done();
						});
				});

			defer.resolve();
			accountNameDefer.resolve('cool name.1234');
		});
	});
});