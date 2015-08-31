describe('test helper', function () {
	it('should expose api endpoint', function () {
		expect(API_ENDPOINT).toBeDefined();
	});

	it('should expose frisby', function () {
		expect(frisby).toBeDefined();
	});

	it('should expose getRandomString()', function () {
		expect(getRandomString()).toBeDefined();
	});

	it('should expose getRandomEmail()', function () {
		expect(getRandomEmail()).toBeDefined();
	});

	it('should expose strong pass', function () {
		expect(strongPass).toBe('1mReallyStrongM@n!');
	});
});