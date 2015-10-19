var ENVIRONMENT = process.env['ENV'];

if (!ENVIRONMENT) {
	throw 'Environment variable "ENV" is not defined!';
}

switch (ENVIRONMENT) {
	case 'DEV':
	case 'BETA':
	case 'PROD':
		break;

	default:
		throw ENVIRONMENT + ' is not a supported environment!';
}

console.log('Running in' + ENVIRONMENT + ' mode!');

var DEV = {
		db: {
			name: "armory",
			user: "admin", // move out of config into a env variable
			password: "password", // move out of config into a env variable
			options: {
				dialect: "mysql",
				host_env_name: "DB_PORT_3306_TCP_ADDR"
			}
		},
		server: {
			port: "80",
		},
		gw2: {
			"endpoint": "https://api.guildwars2.com/"
		},
		jwt_tokens: {
			secret: "im-secret", // move out of config into a env variable
			expires_in: 60
		},
		ping: {
			port: "8081",
			interval: 600000,
			retries: 5,
			verbose: true,
			host_env_name: "FETCH_PORT_8081_TCP_ADDR"
		},
		allowed_cors: [
			'*'
		]
	};

var BETA = {
		db: {
			name: "armory",
			user: "admin", // move out of config into a env variable
			password: "password", // move out of config into a env variable
			options: {
				dialect: "mysql",
				host: "https://gw2armory-beta.czyc9rwqas2f.us-west-2.rds.amazonaws.com:3306"
			}
		},
		server: {
			port: "80",
		},
		gw2: {
			"endpoint": "https://api.guildwars2.com/"
		},
		jwt_tokens: {
			secret: "im-secret", // move out of config into a env variable
			expires_in: 60
		},
		ping: {
			port: "8081",
			interval: 600000,
			retries: 5,
			verbose: true,
			host_env_name: "FETCH_PORT_8081_TCP_ADDR"
		},
		allowed_cors: [
			'*'
		]
	};

Object.freeze(DEV);

module.exports = {
	DEV: DEV,
	BETA: BETA,
	PROD: BETA
}[ENVIRONMENT];