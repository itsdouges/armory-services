'use strict';

frisby.create('GET index')
	.get(API_ENDPOINT)
	.expectStatus(200)
	.toss();