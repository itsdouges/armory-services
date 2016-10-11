const gw2Api = require('./index');
const axios = require('axios');

describe('gw2 api', () => {
  const testToken = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15';

  let sut;
  const env = {
    gw2: {
      endpoint: 'https://api.guildwars2.com/',
    },
  };

  beforeEach(() => {
    sut = gw2Api(axios, env);
  });

  it('should return account data', function () {
    this.timeout(40000);

    return sut.readAccount(testToken)
      .then((account) => {
        expect(account.name).to.equal('stress level zero.4907');
      });
  });

  it('should return character data as expected', function () {
    this.timeout(40000);

    return sut.readCharacter('Blastrn', {
      token: testToken,
      showCrafting: true,
      showBags: true,
      showEquipment: true,
    })
    .then((character) => {
      expect(character.name).to.equal('Blastrn');
      expect(character.race).to.equal('Asura');
      expect(character.gender).to.equal('Female');
      expect(character.profession).to.equal('Elementalist');
      expect(character.level).to.equal(80);
      expect(character.age).to.exist;
      expect(character.created).to.equal('2015-06-23T10:53:00Z');
      expect(character.deaths).to.exist;
      expect(character.crafting).to.exist;
      expect(character.equipment).to.exist;
      expect(character.bags).to.exist;
    });
  });

  it('should return pvp stats', function () {
    this.timeout(40000);

    return sut.readPvpStats(testToken)
      .then((pvp) => {
        expect(pvp.pvp_rank).to.exist;
        expect(pvp.pvp_rank_points).to.exist;
        expect(pvp.pvp_rank_rollovers).to.exist;
        expect(pvp.aggregate).to.exist;
        expect(pvp.professions).to.exist;
        expect(pvp.ladders).to.exist;
      });
  });

  it('should return invalid token error', function () {
    this.timeout(40000);

    return sut.readCharacter('Blastrn', {
      token: 'invalid',
    })
    .then(null, (response) => {
      expect(response.status).to.equal(403);
    });
  });

  it('should return characters data as expected', function () {
    this.timeout(40000);

    sut.readCharacters(testToken)
      .then((data) => {
        expect(Array.isArray(data)).to.equal(true);
      });
  });
});
