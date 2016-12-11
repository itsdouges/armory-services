const _ = require('lodash');

function read (models, { id, name }) {
  return models.Gw2Guild.findOne({
    where: id ? { id } : { name },
  })
  .then((guild) => {
    if (!guild) {
      return undefined;
    }

    return _.pick(guild, [
      'id',
      'tag',
      'name',
      'motd',
      'level',
      'influence',
      'aetherium',
      'resonance',
      'favor',
    ]);
  });
}

function list (models) {
  return models.Gw2Guild.findAll();
}

module.exports = {
  read,
  list,
  isAccessAllowed () {
    return Promise.resolve(false);
  },
};
