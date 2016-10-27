const _ = require('lodash');

const TABLE_NAME = 'Gw2ApiToken';

function columnExists (attributes, columnName) {
  return Object.prototype.hasOwnProperty.call(attributes, columnName);
}

module.exports = (fields) => ({
  up (queryInterface, Sequelize) {
    return queryInterface
      .describeTable(TABLE_NAME)
      .then((attributes) => {
        if (columnExists(attributes, 'created')) {
          return Promise.resolve();
        }

        return _.reduce(fields(Sequelize), (promise, options, name) => {
          promise.then(() => queryInterface.addColumn(
            TABLE_NAME,
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
        TABLE_NAME,
        name
      ));

      return promise;
    }, Promise.resolve());
  },
});
