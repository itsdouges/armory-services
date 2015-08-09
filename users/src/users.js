function UsersController() {

}

function validateCreation(user) {
	var errors = [];

	validateEmail(user.email, errors);
	validatePassword(user.password, errors);

	if (!user.alias) {
		errors.push('Alias is required');
	}

	return errors;
}

function validateEmail(email, errors) {
	if (!email) {
		errors.push('Email is required');
	}

	// todo: check valid email against regex
}

function validatePassword(password, errors) {
	if (!password) {
		errors.push('Password is required');
	}
}

/** 
 * isEmailTaken:function
 * Returns promise that is resolved if email is free,
 * and rejected if email is taken.
 */
function isEmailTaken(email) {
	// TODO: Implement when db is figured out lolz..
}

UsersController.prototype.validateEmail = validateEmail;
UsersController.prototype.validateUser = validateCreation;

module.exports = UsersController;