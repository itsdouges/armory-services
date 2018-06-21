
import { queryItemAttributes } from 'gw2itemstats';

function convertType (apiType) {
  switch (apiType) {
    case 'Back':
      return 'back item';
    default:
      return apiType;
  }
}

function getMajorKeys (itemAttributes, selectedStat) {
  const attributes = selectedStat.attributes;
  const values = attributes.map((attr) => attr.multiplier);

  const majorAttributeValue = Math.max(...values);
  return attributes.filter(
    (attr) => attr.multiplier === majorAttributeValue
  ).map((attr) => attr.attribute);
}

function getCalcFunctionStandard (itemAttributes, selectedStat) {
  const majorAttributeKeys = getMajorKeys(itemAttributes, selectedStat);
  const calcMajor = (v) => parseInt(itemAttributes.majorAttribute, 10);
  const calcMinor = (v) => parseInt(itemAttributes.minorAttribute, 10);
  const isMajor = (attr) => (majorAttributeKeys.indexOf(attr) > -1);
  return (attr, v) => (isMajor(attr) ? calcMajor(v) : calcMinor(v));
}

function getCalcFunctionQuad (itemAttributes, selectedStat) {
  const majorAttributeKeys = getMajorKeys(itemAttributes, selectedStat);
  const calcMajor = (v) => parseInt(itemAttributes.majorQuadAttribute, 10);
  const calcMinor = (v) => parseInt(itemAttributes.minorQuadAttribute, 10);
  const isMajor = (attr) => (majorAttributeKeys.indexOf(attr) > -1);
  return (attr, v) => (isMajor(attr) ? calcMajor(v) : calcMinor(v));
}

function getCalcFunctionQuadOld (itemAttributes, selectedStat) {
  const minorValue = parseInt(itemAttributes.minorAttribute, 10);
  const majorAttributeKeys = getMajorKeys(itemAttributes, selectedStat);
  const calcMajor = (v) => parseInt(itemAttributes.majorAttribute, 10);
  const calcMinor = (v) => minorValue;

  // This is the most hacky thing ever, but we have 2 items that we need
  // to detect by the position in attributes.
  const isMajorMinor = (attr) => selectedStat.attributes[3].attribute === attr;

  const isMajor = (attr) => (majorAttributeKeys.indexOf(attr) > -1);
  return (attr, v) => {
    if (isMajor(attr)) {
      return calcMajor(v);
    }
    if (isMajorMinor(attr)) {
      return calcMinor(v);
    }

    if (v === 0) {
      return 18;
    }
    return minorValue - 18;
  };
}

function getCalcFunctionCelectiel (itemAttributes) {
  return () => parseInt(itemAttributes.celestialNbr, 10);
}

function getCalcFunction (itemAttributes, selectedStat) {
  if (selectedStat.name.includes(' and ')) {
    return getCalcFunctionQuadOld(itemAttributes, selectedStat);
  }

  switch (selectedStat.attributes.length) {
    case 2:
    case 3:
      return getCalcFunctionStandard(itemAttributes, selectedStat);
    case 4:
      return getCalcFunctionQuad(itemAttributes, selectedStat);
    case 7:
      return getCalcFunctionCelectiel(itemAttributes);
    default:
      throw new Error('impossible condition');
  }
}

export default function calculateAttributes (item, itemStat) {
  if (!item || !itemStat) {
    return [];
  }

  const type = convertType((item.details && item.details.type) || item.type);
  if (!type || !item.rarity || !item.level) {
    return [];
  }

  const itemAttributes = queryItemAttributes(
    type.toLowerCase(),
    item.rarity.toLowerCase(),
    item.level
  );

  const calcModifier = getCalcFunction(itemAttributes, itemStat);

  return itemStat.attributes.map(({attribute, multiplier}) => ({
      attribute,
      // TODO: need to calculate modifier, how?
      modifier: calcModifier(attribute, multiplier),
    }));
}
