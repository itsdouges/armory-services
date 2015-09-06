var token = '14AEEFFA-F207-BA49-9590-1B48E024DF2734665877-34A0-4A8C-81CA-F8A083D20B63';

/**
 * As a user
 * I want to check that my token is valid
 * So I can use it to create an account
 */

// TODO: Orchestrate user creation -> add token -> token cant be taken now
// TODO: Orchestrate user creation -> add token -> add new token from same account

frisby.create('GET check gw2-token with free token')
	.get(API_ENDPOINT + 'users/check/gw2-token/' + token)
	.expectStatus(200)
	.toss();

frisby.create('GET check gw2-token with bad token')
	.get(API_ENDPOINT + 'users/check/gw2-token/imbadtoken')
	.expectStatus(400)
	.toss();