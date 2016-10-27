const _ = require('lodash');

function columnExists (attributes, columnName) {
  return Object.prototype.hasOwnProperty.call(attributes, columnName);
}

module.exports = (fields, tableName) => ({
  up (queryInterface, Sequelize) {
    return queryInterface
      .describeTable(tableName)
      .then((attributes) => {
        if (columnExists(attributes, 'created')) {
          return Promise.resolve();
        }

        return _.reduce(fields(Sequelize), (promise, options, name) => {
          promise.then(() => queryInterface.addColumn(
            tableName,
            name,
            options
          ));

          return promise;
        }, Promise.resolve());
      });
  },
  down (queryInterface) {
    return _.reduce(fields(), (promise, options, name) => {
      promise.then(() => queryInterface.removeColumn(
        tableName,
        name
      ));

      return promise;
    }, Promise.resolve());
  },
});
