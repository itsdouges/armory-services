'use strict';

var Gw2Api = require('./index');
var axios = require('axios');

describe('gw2 api', function () {
	var testToken = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15';

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
			}, function (e) {
				console.log(e);
			});
	}, 40000);

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
	}, 40000);

	it('should return invalid token error', function (done) {
		sut.readCharacter('Blastrn', {
				token: 'invalid'
			})
			.then(null, function (response) {
				expect(response.status).toBe(403);

				done();
			});
	}, 40000);

	it('should return characters data as expected', function (done) {
		sut.readCharacters(testToken)
			.then(function (data) {
				expect(Array.isArray(data)).toBe(true);

				done();
			});
	}, 40000);
});