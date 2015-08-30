'use strict';

var q = require('q');
var Gw2Api = require('./index');

describe('gw2 api', function () {
	var mockAxios = {};
	var sut;

	beforeEach(function () {
		mockAxios.get = function () {};
		sut = Gw2Api(mockAxios, {
			gw2: {
				endpoint: 'www.site.com/'
			}
		});
	});

	it('should call api as expected', function (done) {
		var data = {
			crafting: [],
			bags: [],
			equipment: []
		};

		var promise = q.resolve({
			data: data
		});

		spyOn(mockAxios, 'get').and.returnValue(promise);

		sut.readCharacter('Blastrn', {
				token: 'ahh'
			})
			.then(function (character) {
				expect(mockAxios.get).toHaveBeenCalledWith('www.site.com/v2/characters/Blastrn', {
					headers: {
						'Authorization' : 'Bearer ahh'
					}
				});

				done();
			});
	});

	it('should return character with everything', function (done) {
		var data = {
			crafting: [],
			bags: [],
			equipment: []
		};

		var promise = q.resolve({
			data: data
		});

		spyOn(mockAxios, 'get').and.returnValue(promise);

		sut.readCharacter('Blastrn', {
				token: 'ahh',
				showCrafting: true,
				showBags: true,
				showEquipment: true
			})
			.then(function (character) {
				expect(character.crafting).toBe(data.crafting);
				expect(character.bags).toBe(data.bags);
				expect(character.equipment).toBe(data.equipment);

				done();
			});
	});

	it('should return character with limited', function (done) {
		var data = {
			crafting: [],
			bags: [],
			equipment: []
		};

		var promise = q.resolve({
			data: data
		});

		spyOn(mockAxios, 'get').and.returnValue(promise);

		sut.readCharacter('Blastrn', {
				token: 'ahh',
				showCrafting: false,
				showBags: false,
				showEquipment: false
			})
			.then(function (character) {
				expect(character.crafting).not.toBeDefined();
				expect(character.bags).not.toBeDefined();
				expect(character.equipment).not.toBeDefined();

				done();
			});
	});
});