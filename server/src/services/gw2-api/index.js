'use strict';

function Gw2Api(axios, env) {
	function readAccount (token) {
		var promise = axios.get(env.gw2.endpoint + 'v2/account', {
				headers: {
					'Authorization' : 'Bearer ' + token
				}
		})
		.then(function (e) {
			return e.data;
		});

		return promise;
	}

	var exports = {
		readAccount: readAccount
	};

	return exports;
}

module.exports = Gw2Api;