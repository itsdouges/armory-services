'use strict';

frisby.create('GET check email with free email')
	.get(API_ENDPOINT + 'users/check/email/email@email.com')
	.expectStatus(200)
	.toss();

frisby.create('GET check email with bad email')
	.get(API_ENDPOINT + 'users/check/email/bademail')
	.expectStatus(400)
	.toss();

var randomEmail = getRandomString() + '@' + getRandomString() + '.com';

// todo: taken tests