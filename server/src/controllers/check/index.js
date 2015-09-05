var q = require('q');

function CheckResource(Validator) {
	Validator.addResource({
			name: 'check',
			mode: 'gw2-token',
			rules: {
				token: ['valid-gw2-token', 'required', 'no-white-space']
			}
		}).addResource({
			name: 'check',
			mode: 'email',
			rules: {
				email: ['unique-email', 'required', 'no-white-space']
			}
		}).addResource({
			name: 'check',
			mode: 'alias',
			rules: {
				alias: ['unique-alias', 'required', 'no-white-space']
			}
		});

	CheckResource.prototype.gw2Token = function (token) {
		var validator = Validator({
			resource: 'check',
			mode: 'gw2-token'
		});

		return validator.validate(token);
	};

	CheckResource.prototype.email = function (email) {
		var validator = Validator({
			resource: 'check',
			mode: 'email'
		});

		return validator.validate(email);
	};

	CheckResource.prototype.alias = function (alias) {
		var validator = Validator({
			resource: 'check',
			mode: 'alias'
		});

		return validator.validate(alias);
	};
}

module.exports = CheckResource;