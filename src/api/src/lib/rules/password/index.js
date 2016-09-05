'use strict';

function password (name, val) {
    if (!val) {
        return;
    }

    if (!/(?=^.{8,}$)(?=.*[A-Z])(?=.*[a-z]).*$/.test(val)) {
        return 'must be greater than or equal to 8 characters long, contain one or more uppercase and lowercase character';
    }

    if (val.length >= 50) {
        return 'must be 50 or less characters long';
    }
}

module.exports = password;