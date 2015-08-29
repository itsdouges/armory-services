var Client = require('../src/ping');
var q = require('q');

describe('ping service', function () {
	var mockDatabase;
	var mockRequest;

	beforeEach(function () {
		mockDatabase = {};
		mockRequest = {};
	});

	function systemUnderTest() {
		return new Client({
			verbose: true
		}, mockRequest, mockDatabase);
	}

	it('should call gw2 api for user', function () {
		var deferredGet1;

		var requestOne = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer 1234'
			}
		};

		mockDatabase.users = [
			{
				token: '1234',
				tokenValid: true
			}
		];

		mockRequest.get = function(options) {
			deferredGet1 = q.defer();

			return deferredGet1.promise;
		};

		spyOn(mockRequest, 'get').and.callThrough();

		var sut = systemUnderTest();

		sut.ping();

		deferredGet1.resolve();

		expect(mockRequest.get).toHaveBeenCalledWith(requestOne);
	});

	it('should call gw2 api for each user that has a valid token', function () {
		var deferredGet1;
		var deferredGet2;

		var requestOne = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer 1234'
			}
		};

		var requestTwo = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer 5678'
			}
		};

		var requestThree = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer invalid-mann'
			}
		};

		var requestFour = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer '
			}
		};

		mockDatabase.users = [
			{
				token: '1234',
				tokenValid: true
			}, 
			{
				token: 'invalid-mann',
				tokenValid: false
			}, 
			{
				token: '',
			}, 
			{
				token: '5678',
				tokenValid: true
			}
		];

		mockRequest.get = function(options) {
			deferredGet1 = q.defer();
			deferredGet2 = q.defer();

			if (options.headers.Authorization === 'Bearer 1234') {
				return deferredGet1.promise;
			}

			if (options.headers.Authorization === 'Bearer 5678') {
				return deferredGet2.promise;
			}
		};

		spyOn(mockRequest, 'get').and.callThrough();

		var sut = systemUnderTest();

		sut.ping();

		deferredGet1.resolve();
		deferredGet2.resolve();

		expect(mockRequest.get).toHaveBeenCalledWith(requestOne);
		expect(mockRequest.get).toHaveBeenCalledWith(requestTwo);
		expect(mockRequest.get).not.toHaveBeenCalledWith(requestThree);
		expect(mockRequest.get).not.toHaveBeenCalledWith(requestFour);
	});

	it('should save response to database for each user on success', function () {
		var deferredGet1;
		var deferredGet2;

		var responseOne = [
			'cat',
			'dog'
		];

		var responseTwo = [
			'giraffe',
			'swager'
		];

		mockDatabase.users = [
			{
				token: '1234',
				tokenValid: true,
				characters: []
			}, 
			{
				token: '5678',
				tokenValid: true,
				characters: []
			}
		];

		mockRequest.get = function(options) {
			deferredGet1 = q.defer();
			deferredGet2 = q.defer();

			if (options.headers.Authorization === 'Bearer 1234') {
				return deferredGet1.promise;
			}

			if (options.headers.Authorization === 'Bearer 5678') {
				return deferredGet2.promise;
			}
		};

		var sut = systemUnderTest();

		sut.ping();

		// TODO: Q promises aren't working as expected..

		deferredGet1.resolve(responseOne);
		deferredGet2.resolve(responseTwo);	

		expect(mockDatabase.users[0].characters).toBe(responseOne);
		expect(mockDatabase.users[1].characters).toBe(responseTwo);
	});
});