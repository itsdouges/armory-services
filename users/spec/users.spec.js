var Controller = require('../src/users');

describe('ping service', function () {
	var mockDatabase;
	var mockRest;

	beforeEach(function () {
		mockDatabase = {};
		mockRest = {};
	});

	it('should return no errors if user is valid', function () {
		var controller = new Controller();

		var user = {
			email: 'laheen@gmail.com',
			password: 'swagpass',
			alias: 'madou.9428'
		};

		var errors = controller.validateUser(user);

		expect(errors.length).toBe(0);
	});

	it ('should return email is required if wasnt passed in', function () {
		var controller = new Controller();

		var user = {
			password: 'swagpass',
			alias: 'madou.9428'
		};

		var errors = controller.validateUser(user);

		expect(errors.length).toBe(1);
		expect(errors[0]).toBe('Email is required');
	});

	it ('should return password is required if wasnt passed in', function () {
		var controller = new Controller();

		var user = {
			email: 'swagn@swag.com',
			alias: 'madou.9428'
		};

		var errors = controller.validateUser(user);

		expect(errors.length).toBe(1);
		expect(errors[0]).toBe('Password is required');
	});

	it ('should return alias is required if wasnt passed in', function () {
		var controller = new Controller();

		var user = {
			email: 'swagn@swag.com',
			password: 'swagpass'
		};

		var errors = controller.validateUser(user);

		expect(errors.length).toBe(1);
		expect(errors[0]).toBe('Alias is required');
	});

	it ('should return invalid email error if invalid email', function () {
		var controller = new Controller();

		var user = {
			email: 'swagn@swag.com',
			password: 'swagpass',
			alias: 'ahhh'
		};

		var errors = controller.validateUser(user);

		expect(errors.length).toBe(1);
		expect(errors[0]).toBe('Email is invalid');
	});
});