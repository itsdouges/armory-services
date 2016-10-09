module.exports = function StatisticsResource (server, controller) {
  server.get('/statistics', (req, res, next) => {
    return Promise.all([
      controller.users(),
      controller.guilds(),
      controller.characters(),
    ])
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
