/* THIS IS COPIED FROM COMMON/MODELS */

const fs = require('fs');
const path = require('path');

function Models (sequelize) {
  const db = {};

  fs
    .readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  return db;
}

module.exports = Models;
