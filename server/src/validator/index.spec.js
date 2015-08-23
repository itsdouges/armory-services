'use strict';

var q = require('q');

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

		it('should throw error when inheriting with string if rule not found', function () {
			expect(function () {
				ResourceValidator.addRule({
					name: 'cool-rule',
					func: function () {},
					inherits: 'ayyy'
				});

			}).toThrow(Error('Rule [ayyy] not found, add it before trying to inherit'));
		});

		it('should throw error when inheriting with array if rule not found', function () {
			expect(function () {
				ResourceValidator.addRule({
					name: 'cool-rule',
					func: function () {},
					inherits: ['ayyy']
				});

			}).toThrow(Error(['Rule [ayyy] not found, add it before trying to inherit']));
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
		var promiseRuleDefer;

		ResourceValidator = require('./index');

		beforeEach(function () {
			ResourceValidator.addRule({
				name: 'required-synchronous',
				func: function (name, object) {
					if(!object[name]) {
						return 'is required';
					}
				}
			});

			ResourceValidator.addRule({
				name: 'promise-with-dependency',
				func: function (name, object, dependencies) {
					expect(dependencies.a).toBeDefined();
					expect(dependencies.a.hey).toBe('im defined');

					promiseRuleDefer = q.defer();
					return promiseRuleDefer.promise;
				},
				dependencies: {
					a: {
						hey: 'im defined'
					}
				}
			});

			ResourceValidator.addResource({
				name: 'user',
				mode: 'create',
				rules: {
					email: 'required-synchronous',
					uniqueEmail: 'promise-with-dependency'
				}
			});

			ResourceValidator.addResource({
				name: 'user',
				mode: 'update',
				rules: {
					email: ['required-synchronous', 'promise-with-dependency']
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

		it ('should throw if resolved error object isnt as expected', function (done) {
			// todo: look at q docs to finish test
			done();

			systemUnderTest = new ResourceValidator({
				resource: 'user',
				mode: 'update'
			});

			systemUnderTest.validate({
				email: 'cool@email.com'
			})
			.then(null, function (e) {
				done();
			});

			promiseRuleDefer.resolve('ahhhh');
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

				promiseRuleDefer.resolve();
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

				promiseRuleDefer.resolve();
			});

			it ('should reject promise with unique email is required error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

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

				promiseRuleDefer.resolve({
					message: 'is taken',
					property: 'uniqueEmail'
				});
			});

			it ('should reject promise with required and unique error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'create'
				});

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

				promiseRuleDefer.resolve({
					message: 'is taken',
					property: 'uniqueEmail'
				});
			});

			it ('should call inherited rules', function () {
				var inheritPromiseRuleDefer;

				ResourceValidator.addRule({
					name: 'sync-rule',
					func: function () {
						return 'ayy sync';
					}
				});

				ResourceValidator.addRule({
					name: 'promise-rule-with-inheritance',
					func: function (name, object) {
						inheritPromiseRuleDefer = q.defer();
						return inheritPromiseRuleDefer.promise;
					},
					inherits: 'sync-rule'
				});

				ResourceValidator.addResource({
					name: 'cool',
					mode: 'cooler',
					rules: {
						prop1: 'promise-rule-with-inheritance'
					}
				});

				systemUnderTest = new ResourceValidator({
					resource: 'cool',
					mode: 'cooler'
				});

				systemUnderTest.validate({
					prop1: 'lol'
				})
				.then(null, function (e) {
					expect(e).toEqual([
						'[prop1] ayy sync',
						'[prop1] is cool'
					]);
				});

				inheritPromiseRuleDefer.resolve({
					message: 'is cool',
					property: 'prop1'
				});
			});

			it ('should throw if inherited rule doesnt exist', function () {
				expect(function () {
					ResourceValidator.addRule({
						name: 'promise-rule-with-inheritance',
						func: function (name, object) {
							inheritPromiseRuleDefer = q.defer();
							return inheritPromiseRuleDefer.promise;
						},
						inherits: 'no-exist'
					});
				}).toThrow(Error('Rule [no-exist] not found, add it before trying to inherit'));
			});
		});

		describe('with array', function () {
			it ('should reject promise with unique error', function (done) {
				systemUnderTest = new ResourceValidator({
					resource: 'user',
					mode: 'update'
				});

				systemUnderTest.validate({
					email: 'cool@email.com'
				})
				.then(null, function (e) {
					expect(e).toEqual([
						'[email] is taken'
					]);
					
					done();
				});

				promiseRuleDefer.resolve({
					message: 'is taken',
					property: 'email'
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

				promiseRuleDefer.resolve();
			});

			it ('should call inherited rules', function () {
				var inheritPromiseRuleDefer;

				ResourceValidator.addRule({
					name: 'sync-rule',
					func: function () {
						return 'ayy sync';
					}
				});

				ResourceValidator.addRule({
					name: 'promise-rule-with-inheritance',
					func: function (name, object) {
						inheritPromiseRuleDefer = q.defer();
						return inheritPromiseRuleDefer.promise;
					},
					inherits: ['sync-rule']
				});

				ResourceValidator.addResource({
					name: 'cool',
					mode: 'cooler',
					rules: {
						prop1: 'promise-rule-with-inheritance'
					}
				});

				systemUnderTest = new ResourceValidator({
					resource: 'cool',
					mode: 'cooler'
				});

				systemUnderTest.validate({
					prop1: 'lol'
				})
				.then(null, function (e) {
					expect(e).toEqual([
						'[prop1] ayy sync',
						'[prop1] is cool'
					]);
				});

				inheritPromiseRuleDefer.resolve({
					message: 'is cool',
					property: 'prop1'
				});
			});

			it ('should throw if inherited rule doesnt exist', function () {
				expect(function () {
					ResourceValidator.addRule({
						name: 'promise-rule-with-inheritance',
						func: function (name, object) {
							inheritPromiseRuleDefer = q.defer();
							return inheritPromiseRuleDefer.promise;
						},
						inherits: ['no-exist']
					});
				}).toThrow(Error(['Rule [no-exist] not found, add it before trying to inherit']));
			});
		});
	});
});