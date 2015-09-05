var token = '14AEEFFA-F207-BA49-9590-1B48E024DF2734665877-34A0-4A8C-81CA-F8A083D20B63';

/**
 * As a user
 * I want to check that my token is valid
 * So I can use it to create an account
 */

frisby.create('GET check gw2-token with free token')
	.get(API_ENDPOINT + 'users/check/gw2-token/' + token)
	.expectStatus(200)
	.after(function () {
		frisby.create('POST user with invalid gw2 token')
			.post(API_ENDPOINT + 'users', {
				email: getRandomEmail(),
				password: strongPass,
				alias: getRandomString(),
				gw2ApiTokens: [
					'invalid'
				]
			})
			.expectStatus(400)
			.afterJSON(function (response) {
				expect(response).toEqual([
					'[gw2ApiTokens] invalid token'
				]);
			})
			.after(function () {
				frisby.create('POST user with valid gw2 token')
						.post(API_ENDPOINT + 'users', {
							email: getRandomEmail(),
							alias: getRandomString(),
							password: strongPass,
							gw2ApiTokens: [
								token
							]
						})
						.expectStatus(200)
						.after(function () {
							// TODO: What's happening here that we have to delay for a moment?
							// If we don't pause the token is validated as free, need
							// to understand why.
							// Found out why. It's failing because the key already is being used. LOL! Fix it later..
							frisby.create('GET pause for 3')
								.get('http://httpbin.org/delay/3')
								.expectStatus(200)
								.after(function () {
									frisby.create('GET check gw2-token with taken token')
										.get(API_ENDPOINT + 'users/check/gw2-token/' + token)
										.expectStatus(400)
										.afterJSON(function (response) {
											expect(response).toEqual([
												'[token] is already being used'
											]);
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

frisby.create('GET check gw2-token with bad token')
	.get(API_ENDPOINT + 'users/check/gw2-token/imbadtoken')
	.expectStatus(400)
	.toss();