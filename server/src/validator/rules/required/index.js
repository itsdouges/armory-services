'use strict';

function required(name, object) {
	if (object[name] === undefined) {
		return 'is required';
	}

	return;
}

module.exports = required;