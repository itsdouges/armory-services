var hooks = require('../src/auth-hooks');

describe('auth hooks', function () {
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

	it('should get a token and confirm that it was saved to the database', function () {
		
	});
});