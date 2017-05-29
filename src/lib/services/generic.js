// @flow

import type { Sequelize } from 'flowTypes';

type Id = {
  key: string,
  value: string | number,
};

const delimiter = '|';

export async function setPrivacy (model: Sequelize, privacy: string, { key, value }: Id) {
  const user = await model.findOne({
    where: {
      [key]: value,
    },
  });

  const resourcePrivacy = user.privacy || '';
  if (resourcePrivacy.includes(privacy)) {
    return Promise.resolve();
  }

  const arr = resourcePrivacy.split(delimiter).filter(Boolean);
  arr.push(privacy);

  return model.update({
    privacy: arr.join(delimiter),
  }, {
    where: {
      [key]: value,
    },
  });
}

export async function removePrivacy (model: Sequelize, privacy: string, { key, value }: Id) {
  const user = await model.findOne({
    where: {
      [key]: value,
    },
  });

  const resourcePrivacy = user.privacy || '';
  if (resourcePrivacy.includes(privacy)) {
    return Promise.resolve();
  }

  const arr = resourcePrivacy
    .split(delimiter)
    .filter(Boolean)
    .filter((priv) => priv !== privacy);

  return model.update({
    privacy: arr.join(delimiter),
  }, {
    where: {
      [key]: value,
    },
  });
}
