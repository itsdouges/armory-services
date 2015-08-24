var UserResource = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('user resource', function () {
	var systemUnderTest;
	var mockValidator;
	var models;

	function setupTestData(user, cb) {
		systemUnderTest
			.createUser(user)
			.then(function () {
				cb();
			});
	}

	beforeEach(function (done) {
		mockValidator = function () {
			this.validate = function () {};
		};
		mockValidator.addResource = function () {};

		models = new Models(testDb());
		models.sequelize.sync().then(function () {
			done();
		});

		systemUnderTest = new UserResource(models, mockValidator);
	});

	describe('creation', function () {
		it('should call validator and reject promise if validator returns errors', function (done) {
			var user = {};
			var defer = q.defer();
			var errors = ['im a error'];

			//spyOn(mockValidator, 'validate').and.returnValue(defer.promise);

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