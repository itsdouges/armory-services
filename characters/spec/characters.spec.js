var Client = require('../src/characters');
var q = require('q');

describe('character controller', function () {
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

	it('should return null if character is not in our db', function () {
		var controller = systemUnderTest();
		
		var result = controller.read('not found man');

		expect(result).toBe(null);
	});

	it('should call gw2 api if character is in db', function () {
		var controller = systemUnderTest();

		var character = {
			name: 'legitcharacter'
		};
		
		var result = controller.read('legitcharacter');

		expect(result).toBe(null);
	});

	it('should return null if gw2 call was unsuccessful', function () {
		var controller = systemUnderTest();

		var character = {
			name: 'legitcharacter'
		};
		
		var result = controller.read('legitcharacter');

		expect(result).toBe(null);
	});
});