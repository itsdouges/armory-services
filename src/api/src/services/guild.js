function read (models, { id }) {
  return models.Gw2Guild.findOne({
    where: {
      id,
    },
  })
  .then((guild) => {
    if (!guild) {
      return undefined;
    }

    return {
      id: guild.id,
      tag: guild.tag,
      name: guild.name,
    };
  });
}

module.exports = {
  read,

  isAccessAllowed () {
    return Promise.resolve(false);
  },
};
