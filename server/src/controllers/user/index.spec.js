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
			readAccount: function () {}
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
					alias: ['required', 'unique-alias'],
					email: ['required', 'unique-email', 'no-white-space'],
					password: ['required', 'password', 'no-white-space']
				}
			});
		});

		it('should add users resource in update mode to validator', function () {
			systemUnderTest = new UserResource(models, mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update',
				rules: {
					alias: ['required', 'unique-alias'],
					email: 'required',
					currentPassword: ['required'],
					password: ['required', 'password', 'no-white-space']
				}
			});
		});
	});

	describe('read', function () {
		it('should return user data', function (done) {
			var user = {
				email: 'cool@email.com',
				password: 'password',
				alias: 'madou'
			};

			var defer = q.resolve();
			spyOn(mocks, 'validate').and.returnValue(defer);

			systemUnderTest = new UserResource(models, mockValidator);
			systemUnderTest
				.create(user)
				.then(function (e) {
					return systemUnderTest.read(user.email);
				})
				.then(function (data) {
					expect(data.email).toBe(user.email);
					expect(data.id).toBeDefined();
					expect(data.passwordHash).toBeDefined();
					expect(data.alias).toBe(user.alias);
					
					done();
				});
		});
	});

	describe('updating', function () {
		it('should reject promise if passwords don\'t matach', function (done) {
			var user = {
				email: 'cool@email.com',
				password: 'password',
				alias: 'madou'
			};

			var promise = q.resolve();
			spyOn(mocks, 'validate').and.returnValue(promise);

			systemUnderTest = new UserResource(models, mockValidator);
			systemUnderTest
				.create(user)
				.then(function (e) {
					user.currentPassword = 'WRONGPASS';
					return systemUnderTest.update(user);
				})
				.then(null, function (e) {
					expect(e).toBe('Bad password');

					done();
				});
		});

		it('should resolve promise if passwords matach and commit to db', function (done) {
			var user = {
				email: 'cool@email.com',
				password: 'password',
				alias: 'madou'
			};

			var promise = q.resolve();
			spyOn(mocks, 'validate').and.returnValue(promise);

			systemUnderTest = new UserResource(models, mockValidator);
			systemUnderTest
				.create(user)
				.then(function (e) {
					user.currentPassword = user.password;
					user.password = 'NewPass123';
					user.oldHash = user.passwordHash;

					return systemUnderTest.update(user);
				})
				.then(function (e) {
					return systemUnderTest.read(user.email);
				})
				.then(function (e) {
					expect(e.passwordHash).not.toBe(user.oldHash);
					expect(e.passwordHash).toBe(user.passwordHash);

					done();
				});
		});

		it('should reject if validation fails', function (done) {
			var validationDefer = q.defer();
			spyOn(mocks, 'validate').and.returnValue(validationDefer.promise);

			var user = {};

			systemUnderTest = new UserResource(models, mockValidator);
			systemUnderTest
				.update(user)
				.then(null, function (e) {
					expect(e).toBe('errorrr');

					done();
				});

			validationDefer.reject('errorrr');
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
				alias: 'madou'
			};

			var defer = q.defer();
			// var accountNameDefer = q.defer();
			// var accountName2Defer = q.defer();

			// mocks.gw2Api.readAccount = function (token) {
			// 	if (token === 'haha') {
			// 		return accountNameDefer.promise; 
			// 	}

			// 	if (token === 'nahhman') {
			// 		return accountName2Defer.promise;
			// 	}
			// };

			spyOn(mocks, 'validate').and.returnValue(defer.promise);
			// spyOn(mocks.gw2Api, 'readAccount').and.callThrough();

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
							expect(e.alias).toBe(user.alias);
							// expect(e.gw2_api_tokens[0].token).toBe('haha');
							// expect(e.gw2_api_tokens[0].accountName).toBe('cool name.1234');
							// expect(e.gw2_api_tokens[0].accountId).toBe('ahh');
							// expect(e.gw2_api_tokens[0].UserId).toBe(e.id);
							// expect(e.gw2_api_tokens[1].token).toBe('nahhman');
							// expect(e.gw2_api_tokens[1].accountName).toBe('cool name.4321');
							// expect(e.gw2_api_tokens[1].accountId).toBe('eee');
							// expect(e.gw2_api_tokens[1].UserId).toBe(e.id);

							expect(e.passwordHash).toBe(user.passwordHash);
							expect(e.emailValidated).toBe(false);

							done();
						});
				});

			defer.resolve();
			// accountNameDefer.resolve({
			// 	name: 'cool name.1234',
			// 	id: 'ahh'
			// });

			// accountName2Defer.resolve({
			// 	name: 'cool name.4321',
			// 	id: 'eee'
			// });
		});
	});
});