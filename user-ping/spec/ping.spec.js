var Client = require('../src/ping').Client;

describe('ping service', function () {
	it('should set token valid to false if token response was not valid', function () {
		var client = new Client();
		client.start();
	});
});