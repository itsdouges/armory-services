module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.describeTable('Gw2ApiTokens').then(function (attributes) {
      if (attributes.hasOwnProperty('valid')) {
        return queryInterface.removeColumn('Gw2ApiTokens', 'valid')
          .then(function () {
            return queryInterface.addColumn(
              'Gw2ApiTokens',
              'primary',
              {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'primary'
              }
            );
          });
      }
    });
  }
};
