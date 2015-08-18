var hooks = require('../src/token-hooks');

describe('token hooks', function () {
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

	it ('should do something', function () {

	});
});