'use strict';

function noWhiteSpace(name, object) {
	var item = object[name];
	if (!item) {
		return;
	}

	// todo: regex school
	if (!/([w])+/.test(item)) {
		return 'needs to be a valid email, e.g. "email@valid.com"';
	}
}

module.exports = noWhiteSpace;