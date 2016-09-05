'use strict';

function IndexResource(server) {
    server.get('/', function (req, res, next) {
        res.send(200);
        return next();
    });
}

module.exports = IndexResource;