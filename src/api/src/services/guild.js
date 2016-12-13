import _ from 'lodash';

export function read (models, { id, name }) {
  return models.Gw2Guild.findOne({
    where: id ? { id } : { name },
  })
  .then((guild) => {
    if (!guild) {
      return undefined;
    }

    const data = _.pick(guild, [
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

    return {
      ...data,
      claimed: !!guild.apiToken,
    };
  });
}

export function list (models) {
  return models.Gw2Guild.findAll();
}

export function isAccessAllowed () {
  return Promise.resolve(false);
}
