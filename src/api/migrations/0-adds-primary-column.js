module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.describeTable('Gw2ApiTokens')
      .then((attributes) => {
        if (Object.prototype.hasOwnProperty.call(attributes, 'valid')) {
          return Promise.resolve();
        }

        return queryInterface.removeColumn('Gw2ApiTokens', 'valid')
          .then(() => queryInterface.addColumn('Gw2ApiTokens', 'primary', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'primary',
          }));
      });
  },
};
