// var UserResource = require('./index');
// var Models = require('../../models');
// var q = require('q');
// var testDb = require('../../../spec/helpers/db');

// describe('user resource', function () {
// 	var systemUnderTest;
// 	var mockValidator;
// 	var models;

// 	function setupTestData(user, cb) {
// 		systemUnderTest
// 			.createUser(user)
// 			.then(function () {
// 				cb();
// 			});
// 	}

// 	beforeEach(function (done) {
// 		mockValidator = {
// 			create: function () {},
// 			update: function () {},
// 			email: function () {},
// 			alias: function () {},
// 			gw2Token: function () {}
// 		};

// 		models = new Models(testDb());
// 		models.sequelize.sync().then(function () {
// 			done();
// 		});

// 		systemUnderTest = new UserResource(models, mockValidator);
// 	});

// 	describe('creation', function () {
// 		it('should call validator and reject promise if validator returns errors', function (done) {
// 			var user = {};

// 			var errors = ['im a error'];
// 			spyOn(mockValidator, 'create').and.returnValue(errors);

// 			systemUnderTest
// 				.createUser(user)
// 				.then(null, function (e) {
// 					expect(e).toBe(errors);
// 					expect(mockValidator.create).toHaveBeenCalledWith(user);

// 					done();
// 				});
// 		});

// 		it('should add user to database with expected values', function (done) {
// 			var user = {
// 				email: 'cool@email.com',
// 				password: 'password',
// 				alias: 'madou'
// 			};

// 			spyOn(mockValidator, 'create');

// 			setupTestData(user, function () {
// 				models.User
// 					.findOne({ where: { alias: user.alias }})
// 					.then(function (e) {
// 						expect(e.id).toBeDefined();
// 						expect(e.email).toBe(user.email);
// 						expect(e.alias).toBe(user.alias);
// 						expect(e.passwordHash).toBeDefined();

// 						done();
// 					});
// 				});
// 		});
// 	});

// 	describe('updating', function () {
// 		it('should call validator and reject promise if validator returns errors', function (done) {
// 			var user = {};

// 			var errors = ['im a error'];
// 			spyOn(mockValidator, 'update').and.returnValue(errors);

// 			systemUnderTest
// 				.updateUser(user)
// 				.then(null, function (e) {
// 					expect(e).toBe(errors);
// 					expect(mockValidator.update).toHaveBeenCalledWith(user);

// 					done();
// 				});
// 		});

// 		it('should update user to database with expected values', function (done) {
// 			// TODO: Clean this test up. Horrible!
// 			done();

// 			// TODO: Finish implementation.

// 			var user = {
// 				email: 'cool@email.com',
// 				password: 'password',
// 				alias: 'madou'
// 			};

// 			spyOn(mockValidator, 'create');
// 			spyOn(mockValidator, 'update');

// 			function create () {
// 				setupTestData(user, function () {
// 					models.User
// 						.findOne({ where: { alias: user.alias }})
// 						.then(function (e) {
// 							expect(e.id).toBeDefined();
// 							expect(e.email).toBe(user.email);
// 							expect(e.alias).toBe(user.alias);
// 							expect(e.passwordHash).toBeDefined();

// 							update(e.id, e.passwordHash);
// 						});
// 				});
// 			}

// 			function update (id, oldPassword) {
// 				var updated_user = {
// 					id: id,
// 					email: 'cool@emaillll.com',
// 					password: 'password',
// 					alias: 'madou123'
// 				};

// 				systemUnderTest
// 					.updateUser(user)
// 					.then(function () {
// 						models.User
// 						.findOne({ where: { id: id }})
// 						.then(function (e) {
// 							expect(e.id).toBe(id);
// 							expect(e.email).toBe(updated_user.email);
// 							expect(e.alias).toBe(updated_user.alias);
// 							expect(e.passwordHash).not.toBe(oldPassword);

// 							done();
// 						});
// 					});
// 			}

// 			create();
// 		});
// 	});

// 	describe('availabilities', function () {
// 		describe('email', function () {
// 			it('should return errors if validation failed', function (done) {
// 				var email = 'bademail';

// 				var errors = [];
// 				spyOn(mockValidator, 'email').and.returnValue(errors);

// 				systemUnderTest
// 					.isEmailAvailable(email)
// 					.then(null, function (e) {
// 						expect(e).toBe(errors);
// 						expect(mockValidator.email).toHaveBeenCalledWith(email);
// 						done();
// 					});
// 			});

// 			it('should resolve promise if available', function (done) {
// 				var email = 'bad@email.com';

// 				spyOn(mockValidator, 'email');

// 				systemUnderTest
// 					.isEmailAvailable(email)
// 					.then(function () {
// 						done();
// 					});
// 			});

// 			it('should reject promise if not available', function (done) {
// 				var email = 'good@email.com';

// 				spyOn(mockValidator, 'email');
// 				spyOn(mockValidator, 'create');

// 				var user = {
// 					email: email,
// 					password: 'StrongPassword321',
// 					alias: 'madou'
// 				};

// 				systemUnderTest
// 					.createUser(user)
// 					.then(function () {
// 					systemUnderTest
// 						.isEmailAvailable(email)
// 						.then(null, function () {
// 							done();
// 						});
// 					});
// 			});
// 		});

// 		describe('gw2 token', function () {
// 			it('should reject promise if invalid', function () {
// 				var token = 'tokenu';
// 				var id = '1234';

// 				var defer = q.defer();

// 				spyOn(mockValidator, 'gw2Token').and.returnValue(defer.promise);

// 				systemUnderTest
// 					.updateGw2Token(id, token)
// 					.then(null, function (e) {
// 						expect(e).toBe(errors);
// 						expect(mockValidator.gw2Token).toHaveBeenCalledWith(alias);
// 						done();
// 					});

// 				defer.reject(['errors']);
// 			});
// 		});

// 		describe('alias', function () {
// 			it('should reject promise and return errors if validation failed', function (done) {
// 				var alias = 'alias';

// 				var errors = [];
// 				spyOn(mockValidator, 'alias').and.returnValue(errors);

// 				systemUnderTest
// 					.isAliasAvailable(alias)
// 					.then(null, function (e) {
// 						expect(e).toBe(errors);
// 						expect(mockValidator.alias).toHaveBeenCalledWith(alias);
// 						done();
// 					});
// 			});

// 			it('should resolve promise if available', function (done) {
// 				var alias = 'alias';

// 				spyOn(mockValidator, 'alias');

// 				systemUnderTest
// 					.isAliasAvailable(alias)
// 					.then(function () {
// 						done();
// 					});
// 			});

// 			it('should reject promise if not available', function (done) {
// 				var alias = 'alias';

// 				spyOn(mockValidator, 'email');
// 				spyOn(mockValidator, 'create');

// 				var user = {
// 					email: 'email@email.com',
// 					password: 'StrongPassword321',
// 					alias: alias
// 				};

// 				systemUnderTest
// 					.createUser(user)
// 					.then(function () {
// 					systemUnderTest
// 						.isAliasAvailable(alias)
// 						.then(null, function () {
// 							done();
// 						});
// 					});
// 			});
// 		});
// 	});
// });