'use strict';

var token = require('./index');

describe('valid gw2 token rule', function () {
	it('should resolve if object isnt found', function (done) {
		token('token', {})
			.then(function (e) {
				expect(e).not.toBeDefined();
				done();
			});
	});
});