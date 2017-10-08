// @flow

import calculateAttributes from 'lib/gw2/itemstats';
import { readItemStats } from 'lib/gw2';
import { allSettled } from 'lib/promise';

type Item = {
  type: string,
  rarity: string,
  level: number,
};

export async function read (id: number, item: Item, lang: string) {
  const itemStats = await readItemStats(id, lang);
  const attributes = calculateAttributes(item, itemStats);

  return {
    ...itemStats,
    attributes,
  };
}

type ItemWithStatsId = Item & {
  id: number,
};

export async function bulkRead (items: Array<ItemWithStatsId>, lang: string) {
  const promises = items.map((item) => readItemStats(item.id, lang));

  const stats = await allSettled(promises);
  const itemStats = stats.map(({ state, value }, index) => {
    if (state === 'fulfilled') {
      return value;
    }

    return {
      id: items[index].id,
      error: value.message,
    };
  });

  const calculatedItemStats = items.map((request, index) => {
    const itemStat = itemStats[index];
    if (itemStat.error) {
      return itemStat;
    }

    try {
      const attributes = calculateAttributes(request, itemStat);
      return {
        ...itemStat,
        attributes,
      };
    } catch (e) {
      return {
        id: itemStat.id,
        error: e.message,
      };
    }
  });

  return calculatedItemStats;
}
