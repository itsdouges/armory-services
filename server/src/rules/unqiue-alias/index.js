var q = require('q');

function uniqueAlias(name, object, dependencies) {
	var defer = q.defer();

	var alias = object[name];
	if (!alias) {
		return q.resolve();
	}

	if (!dependencies.models) {
		throw Error('Expected sequelize models object not found');
	}

	dependencies.models.User
		.findOne({ where: { alias: alias }})
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

module.exports = uniqueAlias;