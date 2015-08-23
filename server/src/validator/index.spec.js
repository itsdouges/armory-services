'use strict';

var ResourceValidator;

describe('resource validator', function () {
	beforeEach(function () {
		ResourceValidator = require('./index');
	});

	describe('instantiation', function () {
		it('should throw error if resource is not defined', function () {
			expect(function () {
				new ResourceValidator({
					resource: 'not-defined',
					mode: 'not-defined'
				});
			}).toThrow(Error('Resource is not defined, add one via. ResourceValidator.addResource({}) before trying to instantiate!'));
		});

		it('should throw error if mode is not defined', function () {
			expect(function () {
				ResourceValidator.addRule({
					name: 'defined',
					func: function () {}
				});

				ResourceValidator.addResource({
					name: 'name',
					mode: 'create',
					rules: {
						propertyName: 'defined',
						anotherProperty: ['defined']
					}
				});

				new ResourceValidator({
					resource: 'name',
					mode: 'not-defined'
				});
			}).toThrow(Error('Resource mode is not defined, add one via. ResourceValidator.addResource({}) before trying to instantiate!'));
		});
	});

	describe('adding rule', function () {
		it('should throw error if no object is passed in', function () {
			expect(function () {
				ResourceValidator.addRule();
			}).toThrow(Error('Pass a rule object in!'));
		});

		it('should throw error if name isnt defined', function () {
			expect(function () {
				ResourceValidator.addRule({});
			}).toThrow(Error('Name must be a string!'));
		});

		it('should throw error if rule isnt a function', function () {
			expect(function () {
				ResourceValidator.addRule({
					name: 'ayylmao'
				});

			}).toThrow(Error('Rule must be a function!'));
		});
	});

	describe('adding resource', function () {
		it('should throw three errors on empty object', function () {
			expect(function () {
				ResourceValidator.addResource({});
			}).toThrow(Error(
				[
					'Name not defined', 
					'Mode not defined',
					'Rules not defined'
				]));
		});

		it('should throw error if rules isnt an object', function () {
			expect(function () {
				ResourceValidator.addResource({
					name: 'name',
					mode: 'create',
					rules: 'not an object'
				});
			}).toThrow(Error('Rules has to be an object!'));
		});

		it('should throw error if any of the rules are an object', function () {
			expect(function () {
				ResourceValidator.addResource({
					name: 'name',
					mode: 'create',
					rules: {
						propertyName: {},
						anotherProperty: [{}]
					}
				});
			})
			.toThrow(Error([
				'Rule for property [propertyName] can only be strings! Try a string or array of strings!',
				'Rule in array for property [anotherProperty] can only be strings! Try a string or array of strings!',
			]));
		});

		it('should throw error if any of the rules are arent defined', function () {
			expect(function () {
				ResourceValidator.addResource({
					name: 'name',
					mode: 'create',
					rules: {
						propertyName: 'not defined',
						anotherProperty: ['not-defined']
					}
				});
			})
			.toThrow(Error([
				'Rule "not defined" for property [propertyName] is not defined. Add it before adding a resource!',
				'Rule "not-defined" in array for property [anotherProperty] is not defined. Add it before adding a resource!',
			]));
		});

		it('should add successfully', function () {
			expect(function () {
				ResourceValidator.addRule({
					name: 'defined',
					func: function () {}
				});

				ResourceValidator.addResource({
					name: 'name',
					mode: 'create',
					rules: {
						propertyName: 'defined',
						anotherProperty: ['defined']
					}
				});
			}).not.toThrow();
		});
	});

	describe('runner', function () {
		var systemUnderTest;
		var models;

		var required = require('./rules/required');
		var uniqueEmail = require('./rules/unique-email');
		var Models = require('../models');
		var testDb = require('../../spec/helpers/db');

		beforeEach(function (done) {
			ResourceValidator.addRule({
				name: 'required',
				func: required
			});

			models = new Models(testDb());
			models.sequelize.sync().then(function () {
				done();
			});

			ResourceValidator.addRule({
				name: 'unique-email',
				func: uniqueEmail,
				dependencies: {
					models: models
				}
			});

			ResourceValidator.addResource({
				name: 'user',
				mode: 'create',
				rules: {
					email: 'required',
					uniqueEmail: 'unique-email'
				}
			});

			ResourceValidator.addResource({
				name: 'user',
				mode: 'update',
				rules: {
					email: ['required', 'unique-email']
				}
			});
		});

		it ('should throw error if object isnt passed in', function () {
			systemUnderTest = new ResourceValidator({
				resource: 'user',
				mode: 'create'
			});

			expect(function () {
				systemUnderTest.validate();
			}).toThrow(Error('Only objects can be validated.'));
		});

		describe('with string', function () {		
			it ('should resolve promise with error email is required', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

				systemUnderTest.validate({})
				.then(null, function (e) {
					expect(e).toEqual([
						'[email] is required'
					]);

					done();
				});
			});

			it ('should resolve promise', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

				systemUnderTest.validate({
					email: 'email@email.com'
				})
				.then(function (e) {
					done();
				});
			});

			it ('should reject promise with unique email is required error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

				models.User
					.create({
						email: 'cool@email.com'
					})
					.then(function () {
						systemUnderTest.validate({
							email: 'im here',
							uniqueEmail: 'cool@email.com'
						})
						.then(null, function (e) {
							expect(e).toEqual([
								'[uniqueEmail] is taken'
							]);

							done();
						});
					});
			});

			it ('should reject promise with required and unique error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

				models.User
				.create({
					email: 'cool@email.com'
				})
				.then(function () {
					systemUnderTest.validate({
						uniqueEmail: 'cool@email.com'
					})
					.then(null, function (e) {
						expect(e).toEqual([
							'[email] is required',
							'[uniqueEmail] is taken'
						]);
						
						done();
					});
				});
			});
		});

		describe('with array', function () {
			
			it ('should reject promise with unique error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'update'
				});

				models.User
				.create({
					email: 'cool@email.com'
				})
				.then(function () {
					systemUnderTest.validate({
						email: 'cool@email.com'
					})
					.then(null, function (e) {
						expect(e).toEqual([
							'[email] is taken'
						]);
						
						done();
					});
				});
			});

			it ('should reject promise with required error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'update'
				});

				systemUnderTest.validate({})
				.then(null, function (e) {
					expect(e).toEqual([
						'[email] is required'
					]);
					
					done();
				});
			});
		});
	});
});