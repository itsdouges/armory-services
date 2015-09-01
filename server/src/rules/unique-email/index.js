var q = require('q');

function uniqueEmail(name, val, dependencies) {
	if (!val) {
		return q.resolve();
	}

	if (!dependencies.models) {
		throw Error('Expected sequelize models object not found');
	}

	var promise = dependencies.models.User
		.findOne({ where: { email: val }})
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