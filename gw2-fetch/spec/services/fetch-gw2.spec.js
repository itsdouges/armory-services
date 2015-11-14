'use strict';

var fetch = require('../../src/services/fetch-gw2');
var q = require('q');

describe('fetch gw2 service', function () {
	var systemUnderTest;
	var mockAxios = {};

	beforeEach(function () {
		mockAxios.get = function () {};
	});

	it('should call api as expected', function (done) {
		spyOn(mockAxios, 'get').andReturn(q.resolve({}));

		fetch.fetchCharacters('endpoint/', 'token-yo', mockAxios)
			.then(function () {
				expect(mockAxios.get).toHaveBeenCalledWith('endpoint/v2/characters?page=0&page_size=200', {
					headers: {
						'Authorization' : 'Bearer token-yo'
					}
				});

				done();
			});
	});

	it('should return data as expected', function (done) {
		var data = {
			data: {}
		};

		spyOn(mockAxios, 'get').andReturn(q.resolve(data));

		fetch.fetchCharacters('endpoint/', 'token-yo', mockAxios)
			.then(function (response) {
				expect(data.data).toBe(response);

				done();
			});
	});

	it('should retry 5 times by default if the axios call returned > 500', function (done) {
		spyOn(mockAxios, 'get').andReturn(q.reject({
			status: 500
		}));

		fetch.fetchCharacters('endpoint/', 'token-yo', mockAxios)
			.then(null, function () {
				expect(mockAxios.get.callCount).toBe(5);

				done();
			});
	});
});