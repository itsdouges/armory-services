'use strict';

function required(name, object) {
	var item = object[name];

	if (!item) {
		return;
	}

	if (!/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(item)) {
		return 'must be greater than or equal to 8 characters long, contain one or more uppercase, lowercase, numeric, and special characters';
	}
}

module.exports = required;