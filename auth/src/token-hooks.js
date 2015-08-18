

/**
 * [generateToken description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function generateToken(data) {
    var random = Math.floor(Math.random() * 100001);
    var timestamp = (new Date()).getTime();
    var sha256 = crypto.createHmac('sha256', random + secret + timestamp);

    return sha256.update(data).digest('base64');
}

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

exports.modules = grantUserToken;