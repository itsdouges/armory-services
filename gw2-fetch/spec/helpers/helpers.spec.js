describe('test helpers', function () {
    it('should find db as a global', function () {
        expect(TestDb).toBeDefined();
    });

    it('should expose seedData()', function () {
        expect(seedData).toBeDefined();
    });
});