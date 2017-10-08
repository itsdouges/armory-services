import proxyquire from 'proxyquire';

const attributes = [{}, {}];
const itemStats = {
  id: 153,
  name: 'Shamans',
  attributes: {
    Vitality: 0.35,
    Healing: 0.25,
    ConditionDamage: 0.25,
  },
};

const sandbox = sinon.sandbox.create();
const calculateAttributes = sandbox.stub();
const readItemStats = sandbox.stub();

const controller = proxyquire.noPreserveCache()('./', {
  'lib/gw2/itemstats': { default: calculateAttributes },
  'lib/gw2': { readItemStats },
});

describe('itemstats controller', () => {
  const id = 1234;
  const lang = 'de';
  const item = {
    type: 'Back',
    rarity: 'Ascended',
    level: 80,
  };
  const bulkItems = [item];

  beforeEach(() => {
    calculateAttributes.returns(attributes);
    readItemStats.resolves(itemStats);
  });

  afterEach(() => sandbox.reset());

  describe('read', () => {
    it('should read item stats', async () => {
      await controller.read(id, item, lang);

      expect(readItemStats).to.have.been.calledWith(id, lang);
    });

    it('should calculate attributes', async () => {
      await controller.read(id, item, lang);

      expect(calculateAttributes).to.have.been.calledWith(item, itemStats);
    });

    it('should return item stats and attributes merged', async () => {
      const actual = await controller.read(id, item, lang);

      expect(actual).to.eql({
        ...itemStats,
        attributes,
      });
    });
  });

  describe('bulk read', () => {
    context('for each item', () => {
      it('should read item stats', async () => {
        await controller.bulkRead(bulkItems, lang);

        bulkItems.forEach((stats) => {
          expect(readItemStats).to.have.been.calledWith(stats.id, lang);
        });
      });

      it('should calculate attributes', async () => {
        await controller.bulkRead(bulkItems, lang);

        bulkItems.forEach((stats) => {
          expect(calculateAttributes).to.have.been.calledWith(stats, itemStats);
        });
      });

      it('should return item stats and attributes merged', async () => {
        const actual = await controller.bulkRead(bulkItems, lang);

        expect(actual).to.eql([{
          ...itemStats,
          attributes,
        }]);
      });

      it('should handle any error when fetching the stats', async () => {
        const badItem = {
          id: 1111,
          ...item,
        };
        readItemStats.withArgs(badItem.id, lang).rejects(new Error('Not Found'));

        const actual = await controller.bulkRead([badItem], lang);

        expect(actual).to.eql([{
          error: 'Not Found',
          id: 1111,
        }]);
      });

      it('should handle any error when calculating the attributes', async () => {
        calculateAttributes.withArgs(item, itemStats).throws(new Error('Bad Item'));

        const actual = await controller.bulkRead([item], lang);

        expect(actual).to.eql([{
          error: 'Bad Item',
          id: 153,
        }]);
      });
    });
  });
});
