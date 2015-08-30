'use strict';

function IndexResource(server) {
	server.get('/', function (req, res) {
	    res.send(200);
	    return next();
	});
}

module.exports = IndexResource;