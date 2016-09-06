const TABLE_NAME = 'UserReset';
const USER_ID_FOREIGN_KEY = 'UserId';
const USER_TABLE = 'User';

module.exports = {
  up (queryInterface, Sequelize) {
    console.log('\n== Starting add expries and userId ==\n');

    return queryInterface.describeTable(TABLE_NAME)
      .then((attributes) => {
        if (Object.prototype.hasOwnProperty.call(attributes, 'expires')) {
          console.log('\nExpires exists, aborting.\n');
          return Promise.resolve();
        }

        return queryInterface.addColumn(TABLE_NAME, 'expires', {
          type: Sequelize.DATE,
          allowNull: false,
        })
        .then(() => console.log('\nAdded expires\n'))
        .then(() => queryInterface.addColumn(TABLE_NAME, USER_ID_FOREIGN_KEY, {
          type: Sequelize.UUID,
          allowNull: false,
        }))
        .then(() => console.log('\nAdded UserId\n'))
        .then(() => queryInterface.sequelize.query(`
ALTER TABLE ${TABLE_NAME}
ADD CONSTRAINT ${USER_ID_FOREIGN_KEY}_fkey FOREIGN KEY (${USER_ID_FOREIGN_KEY})
REFERENCES ${USER_TABLE} (id) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;`
        ))
        .then(() => console.log('\nAdded foreign key constaint for UserId\n'));
      });
  },
};
