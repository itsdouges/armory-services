const fs = require('fs');
const path = require('path');

// const executeFirst = ['User', 'Gw2ApiToken'];

function Models (sequelize) {
  const db = {
    sequelize,
  };

  fs
    .readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  // executeFirst.forEach((modelName) => {
  //   if ('associate' in db[modelName]) {
  //     db[modelName].associate(db);
  //   }
  // });

  Object.keys(db).forEach((modelName) => {
    // if (executeFirst.indexOf(modelName) > -1) {
    //   return;
    // }

    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  return db;
}

module.exports = Models;
