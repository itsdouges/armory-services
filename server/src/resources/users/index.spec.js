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

		mockValidator.addResource = function () {};

		models = new Models(testDb());
		models.sequelize.sync().then(function () {
			done();
		});
	});

	describe('initialisation', function () {
		it('should add users resource in create mode to validator', function () {
			spyOn(mockValidator, 'addResource');

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
			spyOn(mockValidator, 'addResource');

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
			spyOn(mockValidator, 'addResource');

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

		// it('should add user to database with expected values', function (done) {
		// 	var user = {
		// 		email: 'cool@email.com',
		// 		password: 'password',
		// 		alias: 'madou'
		// 	};

		// 	spyOn(mockValidator, 'create');

		// 	setupTestData(user, function () {
		// 		models.User
		// 			.findOne({ where: { alias: user.alias }})
		// 			.then(function (e) {
		// 				expect(e.id).toBeDefined();
		// 				expect(e.email).toBe(user.email);
		// 				expect(e.alias).toBe(user.alias);
		// 				expect(e.passwordHash).toBeDefined();

		// 				done();
		// 			});
		// 		});
		// });
	});
});