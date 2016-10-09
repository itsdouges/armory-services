const memoize = require('memoizee');
const config = require('../../../env');

module.exports = function StatisticsResource (server, controller) {
  console.log(`####### ${config.cache.statistics} ###########`);

  const getStats = memoize(() => console.log('Reading stats') || Promise.all([
    controller.users(),
    controller.guilds(),
    controller.characters(),
  ]), {
    maxAge: config.cache.statistics,
    promise: true,
  });

  server.get('/statistics', (req, res, next) => {
    return getStats()
    .then(([users, guilds, characters]) => {
      res.send(200, {
        users,
        guilds,
        characters,
      });
      return next();
    }, (err) => {
      console.log(err);
      res.send(500);
      return next();
    });
  });
};
