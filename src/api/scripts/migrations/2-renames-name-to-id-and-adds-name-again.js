const TABLE_NAME = 'Gw2Characters';

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.describeTable(TABLE_NAME)
      .then((attributes) => {
        if (Object.prototype.hasOwnProperty.call(attributes, 'id')) {
          console.log('\nId exists, aborting.\n');
          return Promise.resolve();
        }

        return queryInterface.renameColumn(TABLE_NAME, 'name', 'id')
        .then(() => console.log('\nRenamed name to id\n'))
        .then(() => queryInterface.changeColumn(TABLE_NAME, 'id', {
          field: 'id',
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        }))
        .then(() => console.log('\nModified id\n'))
        .then(() => queryInterface.addColumn(TABLE_NAME, 'name', {
          field: 'name',
          type: Sequelize.STRING,
          allowNull: false,
        }))
        .then(() => console.log('\nAdded name\n'));
      });
  },
};
