var Client = require('../src/ping').Client;

describe('ping service', function () {
	var mockDatabase;
	var mockRest;

	beforeEach(function () {
		mockDatabase = {};
		mockRest = {};
	});

	function systemUnderTest() {
		return new Client({
			verbose: true
		}, mockRest, mockDatabase);
	}

	it('should call get characters for each user in db', function () {
		mockDatabase.users = [
			{
				token: '1234'
			}, 
			{
				token: '5678'
			}
		];

		
	});

	it('should set token valid to false if token response was not valid', function () {
		var client = systemUnderTest();
		client.start();
	});
});