'use strict';

// todo: move into own library
// todo: kill sublime text 3

var q = require('q');

var resources = {};
var rules = {};

function ResourceValidator (options) {
	if (!resources[options.resource]) {
		throw Error('Resource is not defined, add one via. ResourceValidator.addResource({}) before trying to instantiate!');
	}

	if (!resources[options.resource][options.mode]) {
		throw Error('Resource mode is not defined, add one via. ResourceValidator.addResource({}) before trying to instantiate!');
	}

	ResourceValidator.prototype.validate = function (object) {
		function callValidator(propertyName, object, validator) {
			if (validator.inherits) {
				if (Array.isArray(validator.inherits)) {
					validator.inherits.forEach(function (ruleName) {
						callValidator(propertyName, object, rules[ruleName]);
					});
				} else {
					callValidator(propertyName, object, rules[ruleName]);
				}
			}

			var result = validator.func(property, object, validator.dependencies);
			if (result !== undefined) {
				if (result.toString && result.toString() === '[object Promise]') {
					result.then(function (err) {
						if (err) {
							errors.push('[' + err.property + '] ' + err.message);
						}
					}, function (e) {
						// todo: throw error here? promise rules shouldnt reject unless something bad happened.
					});

					validationPromises.push(result);
				} else {
					errors.push('[' + property + '] ' + result);
					validationPromises.push(q.resolve());
				}
			}
		}

		if (typeof object !== 'object') {
			throw Error('Only objects can be validated.');
		}

		var defer = q.defer();
		var validationPromises = [];
		var errors = [];

		var resource = resources[options.resource][options.mode];
		for (var property in resource.rules) {
			if (!resource.rules.hasOwnProperty(property)) {
				continue;
			}

			var propertyRules = resource.rules[property];
			if (Array.isArray(propertyRules)) {
				propertyRules.forEach(function (ruleName) {
					var validator = rules[ruleName];
					callValidator(property, object, validator);
				});
			} else {
				var ruleName = propertyRules;
				var validator = rules[ruleName];

				callValidator(property, object, validator);
			}
		}

		q.all(validationPromises)
			.then(function () {
				errors.length ? 
					defer.reject(errors) : 
					defer.resolve();
			});

		return defer.promise;
	};
};

ResourceValidator.addRule = function (rule) {
	if (typeof rule !== 'object') {
		throw Error('Pass a rule object in!');
	}

	if (typeof rule.name !== 'string') {
		throw Error('Name must be a string!')
	}

	if (typeof rule.func !== 'function') {
		throw Error('Rule must be a function!');
	}

	if (rule.inherits) {
		if (Array.isArray(rule.inherits)) {
			var errors = [];

			rule.inherits.forEach(function (e) {
				if (!rules[e]) {
					errors.push('Rule [' + e + '] not found, add it before trying to inherit');
				}
			});

			if (errors) {
				throw Error(errors);
			}
		} else {
			if (!rules[rule.inherits]) {
				throw Error('Rule [' + rule.inherits + '] not found, add it before trying to inherit');
			}
		}
	}

	rules[rule.name] = rule;

	return this;
};

ResourceValidator.addResource = function (resource) {
	var errors = []

	function validateRule(property, rule, isArray) {
		var arrayText = isArray ? ' in array' : '';

		if (Array.isArray(rule)) {
			rule.forEach(function (r) {
				validateRule(property, r, true);
			});
		} else if (typeof rule !== 'string') {
			errors.push('Rule'+ arrayText + ' for property [' + property + '] can only be strings! Try a string or array of strings!');
		} else if (!rules[rule]) {
			errors.push('Rule "' + rule + '"' + arrayText + ' for property [' + property + '] is not defined. Add it before adding a resource!');
		}
	}

	if (!resource.name) {
		errors.push('Name not defined');
	}

	if (!resource.mode) {
		errors.push('Mode not defined');
	}

	if (!resource.rules) {
		errors.push('Rules not defined');
	} else if (typeof resource.rules !== 'object') {
		errors.push('Rules has to be an object!');
	} else {
		for (var property in resource.rules) {
			if (!resource.rules.hasOwnProperty(property)) {
				continue;
			}

			validateRule(property, resource.rules[property]);
		}
	}

	if (errors.length) {
		throw Error(errors);
	}

	if (!resources[resource.name]) {
		resources[resource.name] = {};
	}

	resources[resource.name][resource.mode] = resource;
};

module.exports = ResourceValidator;