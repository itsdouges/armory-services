"use strict";

// NOTE: THIS IS A COPIED FILE FROM db-models!

var fs = require("fs");
var path = require("path");

/**
 * Models(sequelize)
 * Returns an object containing all models used in armory, as well
 * as a reference to the sequelize db object passed in.
 */
function Models(sequelize) {
  var db = {};

  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  return db;
}

module.exports = Models;