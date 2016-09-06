const TABLE_NAME = 'UserResets';
const USER_ID_COLUMN_NAME = 'userId';
const EXPIRES_COLUMN_NAME = 'expires';

module.exports = {
  up (queryInterface, Sequelize) {
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
        .then(() => queryInterface.addColumn(TABLE_NAME, USER_ID_COLUMN_NAME, {
          type: Sequelize.UUID,
          allowNull: false,
          onDelete: 'CASCADE',
          references: {
            model: 'Users',
            key: 'id',
          },
        }))
        .then(() => console.log('\nAdded UserId constraint\n'), (e) => console.error(e));
      });
  },
  down (queryInterface) {
    return queryInterface.removeColumn(TABLE_NAME, EXPIRES_COLUMN_NAME)
      .then(() => console.log('\nRemoved expires column\n'))
      .then(() => queryInterface.removeColumn(TABLE_NAME, USER_ID_COLUMN_NAME))
      .then(() => console.log('\nRemoved user_id column\n'));
  },
};
