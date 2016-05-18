'use strict';

var Controller  = require('../../controllers/guild');

function guildsResource (server, models) {
    var controller = Controller(models);

    server.get('guilds/:name', function (req, res, next) {
        controller
            .read(req.params.name)
            .then(function (guild) {
                if (guild) {
                    res.send(200, guild);
                } else {
                    res.send(404);
                }

                return next();
            }, function (error) {
                res.send(500, error);
                return next();
            });
    });
}

module.exports = guildsResource;