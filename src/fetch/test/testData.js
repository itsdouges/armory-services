module.exports = {
  guild ({ id = '1234', apiToken }) {
    return {
      id,
      tag: 'tag',
      name: 'name',
      apiToken,
      favor: 123,
      resonance: 333,
      aetherium: 444,
      influence: 555,
      level: 60,
      motd: 'Cool message of the day',
    };
  },
};
