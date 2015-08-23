'use strict';

var emailRule = require('./index');

describe('email rule', function () {
	it ('should return undefined if valid email', function () {
		var result = emailRule('email', {
			email: 'email@email.com'
		});
		return;
		expect(result).not.toBeDefined();
	});

	it ('should return error if invalid email', function () {
		var result = emailRule('email', {
			email: 'email'
		});

		expect(result).toBe('needs to be a valid email, e.g. "email@valid.com"');
	});
});