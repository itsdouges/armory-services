'use strict';

var Gw2Api = require('./index');
var axios = require('axios');

describe('gw2 api', function () {
	var sut;
	var env = {
		gw2: {
			endpoint: 'https://api.guildwars2.com/'
		}
	};
	
	beforeEach(function () {
		sut = Gw2Api(axios, env);
	});

	it('should return account data', function (done) {
		sut.readAccount('3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A')
			.then(function (account) {
				expect(account.name).toBe('stress level zero.4907');
				
				done();
			});
	});
});