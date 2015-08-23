'use strict';

var q = require('q');

function validGw2Token(name, object, dependencies) {
	var item = object[name];
	if (!item) {
		return q.resolve();
	}

	// todo: implement when i have internet !

	return q.resolve();
}

module.exports = validGw2Token;