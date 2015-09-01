'use strict';

/**
 * As a user
 * I want to check that my email is free
 * So I can use it to create an account
 */

frisby.create('GET check email with free email')
	.get(API_ENDPOINT + 'users/check/email/email@email.com')
	.expectStatus(200)
	.toss();

frisby.create('GET check email with bad email')
	.get(API_ENDPOINT + 'users/check/email/bademail')
	.expectStatus(400)
	.toss();