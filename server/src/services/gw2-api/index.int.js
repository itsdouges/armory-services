'use strict';

var Gw2Api = require('./index');
var axios = require('axios');

describe('gw2 api', function () {
	var testToken = '14FE67AD-1780-F442-9BB0-CDB823F9EDACCDC70614-CB2F-4A09-A0C0-66F3BA3082CD';

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

	it('should return invalid token error', function (done) {
		sut.readCharacter('Blastrn', {
				token: 'invalid'
			})
			.then(null, function (response) {
				expect(response.status).toBe(403);

				done();
			});
	});

	it('should return characters data as expected', function (done) {
		sut.readCharacters(testToken)
			.then(function (data) {
				expect(Array.isArray(data)).toBe(true);

				done();
			});
	});
});