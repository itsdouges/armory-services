module.exports = function IndexResource (server) {
  server.get('/', (req, res, next) => {
    res.send(200, 'Hi! Like looking at data? Check out https://github.com/madou/armory-react or https://github.com/madou/armory-back if you want to contribute to Guild Wars 2 Armory!');
    return next();
  });
};
