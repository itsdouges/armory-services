frisby.create('POST user without request body')
	.post(API_ENDPOINT + 'users')
	.expectStatus(400)
	.afterJSON(function (response) {
		expect(response).toEqual([
			'[alias] is required',
			'[email] is required',
			'[password] is required'
		]);
	})
	.toss();

frisby.create('POST user without email and weak password')
	.post(API_ENDPOINT + 'users', {
		password: 'imweak'
	})
	.expectStatus(400)
	.afterJSON(function (response) {
		expect(response).toEqual([
		'[alias] is required',
		'[email] is required',
		'[password] must be greater than or equal to 8 characters long, contain one or more uppercase, lowercase, numeric, and special characters'
		]);
	})
	.toss();

frisby.create('POST user with bad email and with strong password')
	.post(API_ENDPOINT + 'users', {
		email: 'bademail',
		alias: getRandomString(),
		password: '1MStrong321MAN!'
	})
	.afterJSON(function (response) {
		expect(response).toEqual([
			'[email] needs to be a valid email, e.g. "email@valid.com"'
		]);
	})
	.expectStatus(400)
	.toss();

var randomEmail = getRandomString() + '@' + getRandomString() + '.com';
var strongPass = '1MStrong321MAN!';

frisby.create('POST user with good body')
	.post(API_ENDPOINT + 'users', {
		email: randomEmail,
		password: strongPass,
		alias: 'madou'
	})
	.expectStatus(200)
	.after(function () {
		frisby.create('POST user again and fail because email is taken')
			.post(API_ENDPOINT + 'users', {
				email: randomEmail,
				password: '1MStrong321MAN!',
				alias: 'madou'
			})
			.expectStatus(400)
			.expectJSON([
				'[alias] is taken',
				'[email] is taken'
			])
			.toss();

		frisby.create('GET user resource without token')
			.get(API_ENDPOINT + 'users/me')
			.expectStatus(401)
			.toss();

		frisby.create('POST get a token to use')
			.post(API_ENDPOINT + 'token', {
				grant_type: 'password',
				username: randomEmail,
				password: strongPass
			}, { json: true })
			.addHeader('Authorization', 'Basic Z3cyQXJtb3J5V2ViOlNXQGcwci0=')
			.expectStatus(200)
			.afterJSON(function (response) {
				expect(response.expires_in).toBeDefined();
				expect(response.token_type).toBe('Bearer');
				expect(response.access_token).toBeDefined();

				var token = response.token_type + ' ' + response.access_token;

				// TODO:
				// gw2token taken create test
				// gw2token delete test
				// gw2token doesnt exist delete test (should return 200 #idempotent)

				frisby.create('GET user resource with token')
					.get(API_ENDPOINT + 'users/me')
					.addHeader('Authorization', token)
					.expectStatus(200)
					.afterJSON(function (response) {
						expect(response.id).toBeDefined();
						expect(response.email).toBe(randomEmail);
						expect(response.passwordHash).toBeDefined();
						expect(response.emailValidated).toBe(false);
						expect(response.createdAt).toBeDefined();
						expect(response.updatedAt).toBeDefined();

						var newPassword = 'COOLBETTErPas!1';

						frisby.create('PUT user resource with token with wrong password')
							.put(API_ENDPOINT + 'users/me', {
								password: newPassword,
								alias: 'hahaha',
								currentPassword: 'wrong'
							})
							.addHeader('Authorization', token)
							.expectStatus(400)
							.afterJSON(function (response) {
								expect(response).toBe('Bad password'); // need to make this be in line with GottaValidate !

							frisby.create('PUT user resource with token with weak password')
								.put(API_ENDPOINT + 'users/me', {
									password: 'weak',
									alias: 'hahaha',
									currentPassword: strongPass
								})
								.addHeader('Authorization', token)
								.expectStatus(400)
								.afterJSON(function (response) {
									expect(response).toEqual([
										'[password] must be greater than or equal to 8 characters long, contain one or more uppercase, lowercase, numeric, and special characters'
									]);
								})
								.toss();

								frisby.create('PUT user resource with token and succeed')
									.put(API_ENDPOINT + 'users/me', {
										password: newPassword,
										alias: 'new-alias',
										currentPassword: strongPass
									})
									.addHeader('Authorization', token)
									.expectStatus(200)
									.after(function () {
										// TODO: Should we revoke all user tokens? I'm thinking yes..
										
										frisby.create('POST get a NEW token to use')
											.post(API_ENDPOINT + 'token', {
												grant_type: 'password',
												username: randomEmail,
												password: newPassword
											}, { json: true })
											.addHeader('Authorization', 'Basic Z3cyQXJtb3J5V2ViOlNXQGcwci0=')
											.expectStatus(200)
											.afterJSON(function (response) {
												var new_token = response.token_type + ' ' + response.access_token;
												expect(response.expires_in).toBeDefined();
												expect(response.token_type).toBe('Bearer');
												expect(response.access_token).toBeDefined();

												frisby.create('GET user resource with NEW token')
													.get(API_ENDPOINT + 'users/me')
													.addHeader('Authorization', new_token)
													.expectStatus(200)
													.afterJSON(function (response) {
														expect(response.id).toBeDefined();
														expect(response.email).toBe(randomEmail);
														expect(response.passwordHash).toBeDefined();
														expect(response.emailValidated).toBe(false);
														expect(response.createdAt).toBeDefined();
														expect(response.updatedAt).toBeDefined();
													})
													.toss();
											})
											.toss();
									})
									.toss();
							})
							.toss();
					})
					.toss();
			})
			.toss();
	})
	.toss();