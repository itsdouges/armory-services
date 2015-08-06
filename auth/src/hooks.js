'use strict';

var _ = require('underscore');
var crypto = require('crypto');

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

/**
 * [generateToken description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function generateToken(data) {
    var random = Math.floor(Math.random() * 100001);
    var timestamp = (new Date()).getTime();
    var sha256 = crypto.createHmac('sha256', random + require('../package.json').secret + timestamp);

    return sha256.update(data).digest('base64');
}

function validateClient (credentials, req, cb) {
    // Call back with `true` to signal that the client is valid, and `false` otherwise.
    // Call back with an error if you encounter an internal server error situation while trying to validate.

    var isValid = _.has(database.clients, credentials.clientId) &&
                  database.clients[credentials.clientId].secret === credentials.clientSecret;
    cb(null, isValid);
};

function grantUserToken (credentials, req, cb) {
    var isValid = _.has(database.users, credentials.username) &&
                  database.users[credentials.username].password === credentials.password;
                  
    if (isValid) {
        // If the user authenticates, generate a token for them and store it so `exports.authenticateToken` below
        // can look it up later.

        var token = generateToken(credentials.username + ':' + credentials.password);
        database.tokensToUsernames[token] = credentials.username;

        // Call back with the token so Restify-OAuth2 can pass it on to the client.
        return cb(null, token);
    }

    // Call back with `false` to signal the username/password combination did not authenticate.
    // Calling back with an error would be reserved for internal server error situations.
    cb(null, false);
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
exports.grantUserToken = grantUserToken;
exports.authenticateToken = authenticateToken;