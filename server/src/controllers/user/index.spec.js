var UserResource = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');
var i = 0;
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
			systemUnderTest = new UserResource(models, mockValidator);

			done();
		});

		spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
		spyOn(mockValidator, 'addRule').and.returnValue(mockValidator);
	});

	describe('initialisation', function () {
		it('should add users resource in create mode to validator', function () {
			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'create',
				rules: {
					alias: ['required', 'unique-alias', 'no-white-space', 'min5'],
					email: ['required', 'unique-email', 'no-white-space'],
					password: ['required', 'password', 'no-white-space']
				}
			});
		});

		it('should add users resource in update mode to validator', function () {
			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'users',
				mode: 'update-password',
				rules: {
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

			systemUnderTest
				.create(user)
				.then(function (data) {
					expect(data.email).toBe(user.email);
					expect(data.id).toBeDefined();
					expect(data.passwordHash).toBeDefined();
					expect(data.alias).toBe(user.alias);
					
					done();
				});
		});

		function initialiseUserData () {
			var promise = q.resolve();
			spyOn(mocks, 'validate').and.returnValue(promise);

			var user = {
				email: 'cool@email.com',
				password: 'password',
				alias: 'madou'
			};

			return systemUnderTest.create(user)
				.then(function (result) {
					var token = {
						token: 'i-am-token',
						accountName: 'coolaccount.1234',
						permissions: 'abc,def',
						world: 'aus',
						accountId: 'i-am-id',
						UserId: result.id
						// todo: permission testing
					};

					return models.Gw2ApiToken.create(token);
				})
				.then(function (result) {
					var character = {
						name: 'madoubie',
						race: 'yolon',
						gender: 'male',
						profession: 'elementalist',
						level: '69',
						created: 'Sat Oct 24 2015 19:30:34',
						age: 1234,
						guild: 'a-guild',
						deaths: 0,
						Gw2ApiTokenToken: result.token
						// todo: permission testing
					};

					return models.Gw2Character.create(character);
				});
		}

		it('should return public user data', function (done) {
			initialiseUserData()
				.then(function (data) {
					return systemUnderTest.readPublic('madou');
				})
				.then(function (data) {
					expect(data.alias).toBe('madou');
					expect(data.createdAt).toBeDefined();
					expect(data.characters).toEqual([{
						accountName: 'coolaccount.1234',
						world: 'aus',
						name: 'madoubie',
						gender: 'male',
						profession: 'elementalist',
						level: 69,
						race: 'yolon'
					}]);

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

			systemUnderTest
				.create(user)
				.then(function (e) {
					user.currentPassword = 'WRONGPASS';
					return systemUnderTest.updatePassword(user);
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

			systemUnderTest
				.create(user)
				.then(function (e) {
					user.currentPassword = user.password;
					user.password = 'NewPass123';
					user.oldHash = user.passwordHash;

					return systemUnderTest.updatePassword(user);
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

			systemUnderTest
				.updatePassword(user)
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

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

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
							expect(e.passwordHash).toBe(user.passwordHash);
							expect(e.emailValidated).toBe(false);

							done();
						});
				});

			defer.resolve();
		});
	});
});