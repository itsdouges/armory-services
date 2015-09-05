'use strict';

var RESOURCE = Object.freeze({
	endpoint: 'token'
});

function CharactersResource(server) {
	server.get(RESOURCE.endpoint, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    } else {
			res.send(200);
    }

    return next();
	});
}

module.exports = CharactersResource;