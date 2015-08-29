var CheckResource = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('check resource', function () {
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

	beforeEach(function () {
		mockValidator = function () {
			return {
				validate: mocks.validate
			};
		};

		mockValidator.addResource = function () { };

		spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
	});

	describe('initialisation', function () {
		it('should add gw2 token resource to validator', function () {
			systemUnderTest = new CheckResource(mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'check',
				mode: 'gw2-token',
				rules: {
					token: ['valid-gw2-token', 'required', 'no-white-space']
				}
			});
		});

		it('should add email resource to validator', function () {
			systemUnderTest = new CheckResource(mockValidator);

			expect(mockValidator.addResource).toHaveBeenCalledWith({
				name: 'check',
				mode: 'email',
				rules: {
					email: ['unique-email', 'required', 'no-white-space']
				}
			});
		});
	});

	describe('gw2-token', function () {
		it('should resolve', function (done) {
			systemUnderTest = new CheckResource(mockValidator);

			var defer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest.gw2Token('token')
				.then(function () {
					expect(mocks.validate).toHaveBeenCalledWith('token');

					done();
				});

			defer.resolve();
		});

		it('should reject', function (done) {
			systemUnderTest = new CheckResource(mockValidator);

			var defer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest.gw2Token('token')
				.then(null, function () {
					expect(mocks.validate).toHaveBeenCalledWith('token');

					done();
				});

			defer.reject();
		});
	});

	describe('email', function () {
		it('should resolve', function (done) {
			systemUnderTest = new CheckResource(mockValidator);

			var defer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest.email('email')
				.then(function () {
					expect(mocks.validate).toHaveBeenCalledWith('email');

					done();
				});

			defer.resolve();
		});

		it('should reject', function (done) {
			systemUnderTest = new CheckResource(mockValidator);

			var defer = q.defer();

			spyOn(mocks, 'validate').and.returnValue(defer.promise);

			systemUnderTest.email('email')
				.then(null, function (e) {
					expect(e).toBe('ahh!!!');

					done();
				});

			defer.reject('ahh!!!');
		});
	});
});