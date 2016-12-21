import _ from 'lodash';

export async function readPrivate (models, { id, name }) {
  return await models.Gw2Guild.findOne({
    where: id ? { id } : { name },
  });
}

export async function read (models, { id, name }) {
  const guild = await readPrivate(models, { id, name });
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
}

export async function list (models) {
  return await models.Gw2Guild.findAll();
}

export async function isAccessAllowed () {
  return await Promise.resolve(false);
}
