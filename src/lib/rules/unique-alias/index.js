'use strict';

var q = require('q');

function uniqueAlias(name, value, dependencies) {
    if (!value) {
        return q.resolve();
    }

    if (!dependencies.models) {
        throw Error('Expected sequelize models object not found');
    }

    return dependencies.models.User
        .findOne({ where: { alias: value }})
        .then(function (item) {
            return item ? {
                property: name,
                message: 'is taken'
            } : undefined;
        });
};

module.exports = uniqueAlias;