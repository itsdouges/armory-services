module.exports = {
	dev: {
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
			port: "8082",
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
			'http://localhost:3030'
		]
	},
	beta: {

	},
	prod: {
		
	}
}[process.env.ENVIRONMENT || 'dev'];