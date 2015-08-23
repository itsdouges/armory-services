'use strict';

var noWhiteSpace = require('./index');

describe('no white space rule', function () {
	it ('should return undefined if has no spaces', function () {
		var result = noWhiteSpace('hey', {
			hey: 'hey'
		});

		expect(result).not.toBeDefined();
	});

	it ('should return error if has spaces anywhere', function () {
		var result = noWhiteSpace('hey', {
			hey: ' '
		});

		expect(result).toBe('is not allowed to have spaces');
	});

	it ('should return error if has spaces anywhere 2', function () {
		var result = noWhiteSpace('hey', {
			hey: ' a'
		});

		expect(result).toBe('is not allowed to have spaces');
	});

	it ('should return error if has spaces anywhere 3', function () {
		var result = noWhiteSpace('hey', {
			hey: 'a s     s '
		});

		expect(result).toBe('is not allowed to have spaces');
	});
});