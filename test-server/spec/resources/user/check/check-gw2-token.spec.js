var token = '3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A';

frisby.create('GET check gw2-token with free token')
	.get(API_ENDPOINT + 'users/check/gw2-token/' + token)
	.expectStatus(200)
	.after(function () {
		frisby.create('POST user with invalid gw2 token')
			.post(API_ENDPOINT + 'users', {
				email: getRandomEmail(),
				password: strongPass,
				gw2ApiTokens: [{
					token: 'invalid'
				}]
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
							password: strongPass,
							gw2ApiTokens: [{
								token: token
							}]
						})
						.expectStatus(200)
						.after(function () {
							frisby.create('GET check gw2-token with taken token')
								.get(API_ENDPOINT + 'users/check/gw2-token/' + token)
								.expectStatus(400)
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

// todo: taken tests