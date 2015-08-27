var UserResource = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('user resource', function () {
	var systemUnderTest;
	var models;

	var mocks = {
		validate: function () {}
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
		models.sequelize.sync().then(function () {
			done();
		});

		spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
		spyOn(mockValidator, 'addRule').and.returnValue(mockValidator);
	});

	describe('initialisation', function () {
		it('should add domain specific rules', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			// TODO: Think up how to test this better.
			expect(mockValidator.addRule).toHaveBeenCalled();
			expect(mockValidator.addRule.calls.count()).toEqual(3);
		});

		it('should add users resource in create mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'create',
				rules: {
					email: ['required', 'unique-email', 'no-white-space'],
					alias: ['required', 'unique-alias', 'no-white-space'],
					password: ['required', 'strong-password', 'no-white-space'],
					gw2Token: ['valid-gw2-token', 'no-white-space']
				}
			});
		});

		it('should add users resource in update mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update',
				rules: {
					alias: ['required', 'unique-alias', 'no-white-space'],
					password: ['required', 'strong-password', 'no-white-space']
				}
			});
		});

		it('should add users resource in update-gw2-token mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update-gw2-token',
				rules: {
					gw2Token: ['valid-gw2-token', 'no-white-space']
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
				alias: 'madou',
				gw2ApiToken: 'haha'
			};

			var defer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest = new UserResource(models, mockValidator);

			systemUnderTest
				.create(user)
				.then(function () {
					models.User
						.findOne({ where: { alias: user.alias }})
						.then(function (e) {
							expect(e.id).toBeDefined();
							expect(e.email).toBe(user.email);
							expect(e.alias).toBe(user.alias);
							expect(e.gw2ApiToken).toBe(user.gw2ApiToken);
							expect(e.passwordHash).toBeDefined();
							expect(e.emailValidated).toBe(false);

							done();
						});

					done();
				});

			defer.resolve();
		});
	});
});