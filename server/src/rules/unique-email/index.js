var q = require('q');

function uniqueEmail(name, object, dependencies) {
	var email = object[name];
	if (!email) {
		return q.resolve();
	}

	if (!dependencies.models) {
		throw Error('Expected sequelize models object not found');
	}

	var promise = dependencies.models.User
		.findOne({ where: { email: email }})
		.then(function (item) {
			if (item) {
				return {
						property: name,
						message: 'is taken'
					};
			}
		});

	return promise;
};

module.exports = uniqueEmail;