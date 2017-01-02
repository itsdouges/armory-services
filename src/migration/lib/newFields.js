const _ = require('lodash');

function columnExists (attributes, columnName) {
  // eslint-disable-next-line no-prototype-builtins
  return attributes.hasOwnProperty(columnName);
}

module.exports = (fields, tableName) => ({
  up (queryInterface, Sequelize) {
    return queryInterface
      .describeTable(tableName)
      .then((attributes) => {
        const newFields = fields(Sequelize);
        let bailOut = false;

        Object.keys(newFields).forEach((columnName) => {
          if (columnExists(attributes, columnName)) {
            bailOut = true;
            console.log(`=== Column ${columnName} already exists ===`);
          }
        });

        if (bailOut) {
          console.log('=== Aborting migration ===');
          return Promise.resolve();
        }

        return _.reduce(newFields, (promise, options, name) => {
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
