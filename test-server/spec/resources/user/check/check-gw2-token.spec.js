frisby.create('GET check gw2-token with free token')
	.get(API_ENDPOINT + 'users/check/gw2-token/3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A')
	.expectStatus(200)
	.toss();

frisby.create('GET check gw2-token with bad token')
	.get(API_ENDPOINT + 'users/check/gw2-token/imbadtoken')
	.expectStatus(400)
	.toss();

// todo: taken tests