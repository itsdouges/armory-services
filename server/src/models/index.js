"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");

var env = process.env.ENVIRONMENT || 'dev';
var config = require(__dirname + '/../../env/' + env + '.json');

var sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    "dialect": "mysql",
    "host": process.env.DB_PORT_3306_TCP_ADDR,
    "port": "3306"
});

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
db.Sequelize = Sequelize;

module.exports = db;