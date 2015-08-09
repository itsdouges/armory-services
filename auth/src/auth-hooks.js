'use strict';

var _ = require('underscore');
var crypto = require('crypto');
var secret = require('../package.json').secret;
var tokenHook = require('./token-hook');

// todo: implement perm data store!!!
var database = {
    clients: {
        gw2ArmoryWeb: { secret: 'SW@g0r-' }
    },
    users: {
        AzureDiamond: { password: 'hunter2' }
    },
    tokensToUsernames: {}
};
// end todo

function validateClient (credentials, req, cb) {
    // Call back with `true` to signal that the client is valid, and `false` otherwise.
    // Call back with an error if you encounter an internal server error situation while trying to validate.

    var isValid = _.has(database.clients, credentials.clientId) &&
                  database.clients[credentials.clientId].secret === credentials.clientSecret;
                  
    cb(null, isValid);
};



function authenticateToken (token, req, cb) {
    if (_.has(database.tokensToUsernames, token)) {
        // If the token authenticates, set the corresponding property on the request, and call back with `true`.
        // The routes can now use these properties to check if the request is authorized and authenticated.
        req.username = database.tokensToUsernames[token];
        return cb(null, true);
    }

    // If the token does not authenticate, call back with `false` to signal that.
    // Calling back with an error would be reserved for internal server error situations.
    cb(null, false);
};

exports.validateClient = validateClient;
exports.grantUserToken = tokenHook;
exports.authenticateToken = authenticateToken;