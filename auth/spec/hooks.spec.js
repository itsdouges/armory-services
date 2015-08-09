var hooks = require('../src/hooks');

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

	it('should return return true if the calling client is allowed', function () {
		var cb = function (e, valid) {
			expect(valid).toBeTrue();
		}

		expect(true).toBeTrue();

		var credentials = {
			gw2ArmoryWeb: {
				secret: 'SW@g0r-'
			}
		};
		
		hooks.validateClient(credentials, null, cb);
	});

	it('should return return false if the calling client is not allowed', function () {
		var cb = function (e, valid) {
			expect(valid).toBeTrue();
		}

		expect(true).toBeTrue();

		var credentials = {
			gw2ArmoryWeb: {
				secret: 'SW@g0r-'
			}
		};
		
		hooks.validateClient(credentials, null, cb);
	});

	it ('should generate token if user is valid', function () {

	});

	it ('should return false if user is not valid', function () {

	});

	it ('should return true if token is valid', function () {

	});

	it ('should return false if token is invalid', function () {

	});

	it ('should return false if token has expired', function () {

	});
});