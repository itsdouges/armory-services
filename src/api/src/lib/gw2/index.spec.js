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

        sinon.stub(mockAxios, 'get').returns(promise);

        sut.readCharacter('Blastrn', {
                token: 'ahh'
            })
            .then(function (character) {
                expect(mockAxios.get).to.have.been.calledWith('www.site.com/v2/characters/Blastrn', {
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

        sinon.stub(mockAxios, 'get').returns(promise);

        sut.readCharacter('Blastrn', {
                token: 'ahh',
                showCrafting: true,
                showBags: true,
                showEquipment: true
            })
            .then(function (character) {
                expect(character.crafting).to.equal(data.crafting);
                expect(character.bags).to.equal(data.bags);
                expect(character.equipment).to.equal(data.equipment);

                done();
            });
    });
});
