'use strict';

function noWhiteSpace(name, object) {
	var item = object[name];
	if (!item) {
		return;
	}

	if (/\s/g.test(item)) {
		return 'is not allowed to have spaces';
	}
}

module.exports = noWhiteSpace;