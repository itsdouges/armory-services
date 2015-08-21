var Validator = require('./user-validator');
var Models = require('../models');
var testDb = require('../../spec/helpers/db');

describe('user validator', function () {
	var systemUnderTest;
	var models;

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync().then(function () {
			done();
		});

		systemUnderTest = new Validator(models.User);
	});

	describe('creation', function () {
		it ('should return required errors', function (done) {
			var user = {
				email: '',
				alias: '',
				password: ''
			};

			systemUnderTest
				.create(user)
				.then(null, function (errors) {
					expect(errors).toEqual([
						'Email is required',
						'Alias is required',
						'Password is required'
					]);

					done();
				});
		});
	});
});