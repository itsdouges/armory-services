'use strict';
var q = require('q');

var password = require('password-hash-and-salt');
var Controller = require('./index');
var Models = require('../../models');
var testDb = require('../../../spec/helpers/db');

describe('auth controller', function () {
	var sut;
	var models;

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			done();
		});

		sut = Controller(models, {
			secret: 'secret'
		});
	});

	var createInitialUser = function () {
		var defer = q.defer();

		password('coolpassword').hash(function (err, hash) {
			models
				.User
				.create({
					email: 'cool@email',
					passwordHash: hash
				})
				.then(function () {
					defer.resolve();
				});
		});

		return defer.promise;
	};

	it('should cb with token and add it to db', function (done) {
		createInitialUser()
			.then(function () {
				sut.grantUserToken({
					username: 'cool@email',
					password: 'coolpassword'
				}, null, function (err, res) {
					expect(res).toBeDefined();
					expect(res).toBeTruthy();

					models
						.UserToken
						.findOne({
							where: {
								token: res
							}
						})
						.then(function (item) {
							expect(item.token).toBe(res);
							expect(item.email).toBe('cool@email');

							done();
						});
				});
			});
	});

	it('should cb with false if wrong password sent in for existing user', function (done) {
		createInitialUser()
			.then(function () {
				sut.grantUserToken({
					username: 'cool@email',
					password: 'badpass'
				}, null, function (err, res) {
					expect(res).toBe(false);

					done();
				});
			});
	});

	it('should cb with false', function (done) {
			sut.grantUserToken({
				username: 'cool@email',
				password: 'coolpassword'
			}, null, function (err, res) {
				expect(res).toBe(false);

				done();
			});
	});

	it('should authenticate token', function (done) {
		var req = {};

		createInitialUser()
			.then(function () {
				sut.grantUserToken({
					username: 'cool@email',
					password: 'coolpassword'
				}, null, function (err, token) {
					sut.authenticateToken(token, req, function (err, validated) {
						expect(validated).toBe(true);
						expect(req.username).toBe('cool@email');

						done();
					});
				});
			});
	});

	describe('client validation', function () {
		it('should cb true', function (done) {
			sut.validateClient(null, null, function (err, res) {
				expect(res).toBe(true);
				
				done();
			});
		});
	});
});