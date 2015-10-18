// if (!process.env.ENV) {
// 	throw 'Environment variable "ENV" is not defined!';
// }

// switch (process.env.ENV) {
// 	case 'DEV':
// 	case 'BETA':
// 	case 'PROD':
// 		break;

// 	default:
// 		throw process.env.ENV + ' is not a supported environment!';
// }

// if (process.env.ENV) {
// 	throw 'Evironment variable "ENV" is not defined!';
// }

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

Object.freeze(DEV);

module.exports = {
	DEV: DEV,
	BETA: DEV,
	PROD: DEV
}[process.env.ENV || 'DEV'];