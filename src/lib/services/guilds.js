import gw2 from 'lib/gw2';

module.exports = {
  fetch (models, ids) {
    const calls = ids.reduce((promises, guildId) => {
      const promise = models.Gw2Guild.findOne({
        where: {
          id: guildId,
        },
      })
      .then((guild) => !guild && gw2.readGuildPublic(guildId))
      .then((guild) => {
        return guild && models.Gw2Guild.create({
          id: guild.guild_id,
          name: guild.guild_name,
          tag: guild.tag,
        });
      });

      promises.push(promise);

      return promises;
    }, []);

    return Promise.all(calls);
  },
};
