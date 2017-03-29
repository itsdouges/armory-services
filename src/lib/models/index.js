const fs = require('fs');
const path = require('path');

function Models (sequelize) {
  const db = {};

  if (process.env.TEST) {
    // Literally no idea. Nyc can't find the files until a second
    // call of this. To see: run: `npm run coverage` with and without
    // the following line AND YOU WILL SEE !
    fs.readdirSync(__dirname);
  }

  fs.readdirSync(__dirname)
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

  // This has to be assigned last for some reason else
  // things blow up. ????????
  db.sequelize = sequelize;
  return db;
}

module.exports = Models;
