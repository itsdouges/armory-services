'use strict';

function password (name, val) {
	if (!val) {
		return;
	}

	if (!/(?=^.{8,}$)(?=.*[A-Z])(?=.*[a-z]).*$/.test(val)) {
		return 'must be greater than or equal to 8 characters long, contain one or more uppercase and lowercase character';
	}
}

module.exports = password;