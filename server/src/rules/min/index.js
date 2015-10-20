'use strict';

function min5 (name, value) {
	if (!value) {
		return;
	}

	if (value.length < 5) {
		return 'needs to be at least 5 characters long!';
	}
};

module.exports = {
	five: min5
};