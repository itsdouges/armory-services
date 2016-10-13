const Sequelize = require('sequelize');
const restify = require('restify');

const pingFactory = require('./ping');
const Models = require('./models');
const fetchCharacters = require('./fetchers/characters');

const config = require(`${__dirname}/../config`);

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);
const fetchData = pingFactory(models, [
  fetchCharacters,
]);

const server = restify.createServer({
  name: 'gw2-fetch',
});

server.use(restify.bodyParser());

server.get('/', (req, res, next) => {
  res.send('I am alive');
  return next();
});

server.post('/fetch-characters', (req, res, next) => {
  console.log(`\n=== Single fetch triggered for ${req.params.token} ===\n`);

  fetchCharacters(models, req.params.token)
    .then(() => {
      res.send(200);
      return next();
    }, (err) => {
      res.send(500, err);
      return next();
    });
});

models.sequelize.sync()
  .then(() => {
    console.log(`\n=== Starting server on port ${config.ping.port}.. ===\n`);

    server.listen(config.ping.port);

    fetchData();

    setInterval(fetchData, config.ping.interval);
  });
