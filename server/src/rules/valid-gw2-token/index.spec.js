'use strict';

var token = require('./index');
var q = require('q');

describe('valid gw2 token rule', function () {
	var mockAxios;
	var mockEnv;

	beforeEach(function () {
		mockAxios = {
			get: function () {}
		};

		mockEnv = {
			gw2: {
				endpoint: 'gw2.com/'
			}
		}
	});

	it('should resolve if item isnt found in object', function (done) {
		token('token', {})
			.then(function () {
				done();
			});
	});

	it('should resolve if token is valid', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv
		}).then(function (e) {
			done();
		});

		expect(mockAxios.get).toHaveBeenCalledWith('gw2.com/tokeninfo', {
			headers: {
				'Authorization' : 'Bearer ee'
			}
		});

		defer.resolve({
			data: {
				permissions: [
					'account',
					'characters'
				]
			}
		});
	});

	it('should reject if token doesnt have characters permission', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv
		}).then(null, function (e) {
			expect(e).toEqual({ 
				property: 'token', 
				message: 'needs characters permission' 
			});

			done();
		});

		defer.resolve({
			data: {
				permissions: [
					'account'
				]
			}
		});
	});

	it('should reject if an error occurred during http', function (done) {
		var defer = q.defer();
		spyOn(mockAxios, 'get').and.returnValue(defer.promise);

		token('token', { token: 'ee' }, { 
			axios: mockAxios,
			env: mockEnv
		}).then(null, function (e) {
			expect(e).toEqual({ 
				property: 'token', 
				message: 'invalid token' 
			});

			done();
		});

		defer.reject();
	});
});