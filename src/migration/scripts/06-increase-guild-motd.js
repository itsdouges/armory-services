module.exports = ({
  up (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn('Gw2Guilds', 'motd', {
        // eslint-disable-next-line new-cap
        type: Sequelize.STRING(1000),
      });
  },
});
