var q = require('q');

function uniqueEmail(name, object, dependencies) {
	var defer = q.defer();

	var email = object[name];
	if (!email) {
		return q.resolve();
	}

	if (!dependencies.models) {
		throw Error('Expected sequelize models object not found');
	}

	dependencies.models.User
		.findOne({ where: { email: email }})
		.then(function (item) {
			item ? defer.resolve({
				property: name,
				message: 'is taken'
			}) : defer.resolve();
		}, function (e) {
			throw e;
		});

	return defer.promise;
};

module.exports = uniqueEmail;