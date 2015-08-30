'use strict';

var Gw2Api = require('./index');
var axios = require('axios');

describe('gw2 api', function () {
	var testToken = '3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A';

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
		sut.readAccount(testToken)
			.then(function (account) {
				expect(account.name).toBe('stress level zero.4907');
				
				done();
			});
	});

	it('should return character data as expected', function (done) {
		sut.readCharacter('Blastrn', {
				token: testToken,
				showCrafting: true,
				showBags: true,
				showEquipment: true
			})
			.then(function (character) {
				expect(character.name).toBe('Blastrn');
				expect(character.race).toBe('Asura');
				expect(character.gender).toBe('Female');
				expect(character.profession).toBe('Elementalist');
				expect(character.level).toBe(80);
				expect(character.age).toBeDefined();
				expect(character.created).toBe('2015-06-23T10:53:00Z');
				expect(character.deaths).toBeDefined();
				expect(character.crafting).toBeDefined();
				expect(character.equipment).toBeDefined();
				expect(character.bags).toBeDefined();

				done();
			});
	});
});