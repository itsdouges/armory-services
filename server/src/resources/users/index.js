'use strict';

var models = require('../../models');
var hasher = require('password-hash-and-salt');

function createUser(req, res, next) {
	var email = req.params.email;
	var password = req.params.password;
	var alias = req.params.alias;
	var gw2token = req.params.gw2token;

	var user = {
		email: email,
		alias: alias,
		password: password,
		gw2ApiToken: gw2token
	};

	if (!validateUser(user)) {
		res.send(400, user);
		next();
		return;
	}

	hashPassword(user);

	models.User.create(user)
		.then(function () {
			res.send(200);
			next();
		}, function (e) {
			res.send(500, e);
			next();
		});
}

function validateUser(user) {
	var errors = [];

	if (!user.email ||
		!user.alias ||
		!user.password ||
		!user.gw2ApiToken) {
		// add errors
	}

	return errors;
}

function hashPassword(user) {
	password('coolpassword').hash(function (error, hash) {
		if (error) {
			return error;
		}

		user.passwordHash = hash;
	});
}

module.exports = {
	createUser: createUser
};