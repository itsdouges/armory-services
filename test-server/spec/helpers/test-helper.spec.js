describe('test helper', function () {
	it('should expose api endpoint', function () {
		expect(API_ENDPOINT).toBeDefined();
	});

	it('should expose frisby', function () {
		expect(frisby).toBeDefined();
	});
});