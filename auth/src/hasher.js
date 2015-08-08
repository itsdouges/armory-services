var password = require('password-hash-and-salt');

var hashy;

password('coolpassword').hash(function (error, hash) {
	hashy = hash;

	console.log(hash);

	password('coolpassword').verifyAgainst(hashy, function (error, verified) {
		console.log(verified);
	});
});