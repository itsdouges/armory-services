'use strict';

var Controller  = require('../../controllers/search');

function search (server, models) {
	var controller = Controller(models);

	server.get('/search', function (req, res, next) {
		controller
			.search(req.params.filter)
			.then(function (results) {
				if (results) {
					res.send(200, results);
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

module.exports = search;