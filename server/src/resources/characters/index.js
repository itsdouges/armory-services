'use strict';

var RESOURCES = Object.freeze({
    character: 'characters/:name'
});

function CharactersResource(server, controller) {
    server.get(RESOURCES.character, function (req, res, next) {
        controller
            .read(req.params.name, false)
            .then(function (character) {
                if (character) {
                    res.send(200, character);
                } else {
                    res.send(404);
                }

                return next();
            }, function (error) {
                console.log(error);
                res.send(500);
                return next();
            });
    });
}

module.exports = CharactersResource;