const EBApplication = require('beanstalkify');
const mustache = require('mustache');
const fs = require('fs');
const EasyZip = require('easy-zip').EasyZip;

const ENVIRONMENT = process.env.ENV;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const IMAGE_UPLOAD_ACCESS_KEY_ID = process.env.IMAGE_UPLOAD_ACCESS_KEY_ID;
const IMAGE_UPLOAD_SECRET_ACCESS_KEY = process.env.IMAGE_UPLOAD_SECRET_ACCESS_KEY;
const DATADOG_KEY = process.env.DATADOG_KEY;
const applicationName = 'gw2armory-api';
const environmentName = `${applicationName}-${ENVIRONMENT.toLowerCase()}`;
const createBeanstalkConfig = require('./beanstalkConfig');

if (!ENVIRONMENT) {
  throw new Error('Environment variable "ENV" is not defined.');
}

if (!ACCESS_KEY_ID) {
  throw new Error('Environment variable "ACCESS_KEY_ID" is not defined.');
}

if (!SECRET_ACCESS_KEY) {
  throw new Error('Environment variable "SECRET_ACCESS_KEY" is not defined.');
}

if (!IMAGE_UPLOAD_ACCESS_KEY_ID) {
  throw new Error('Environment variable "IMAGE_UPLOAD_ACCESS_KEY_ID" is not defined.');
}

if (!IMAGE_UPLOAD_SECRET_ACCESS_KEY) {
  throw new Error('Environment variable "IMAGE_UPLOAD_SECRET_ACCESS_KEY" is not defined.');
}

console.log(`Deploying ${environmentName}...`);

function readModuleFile (path, callback) {
  try {
    const filename = require.resolve(path);
    fs.readFile(filename, 'utf8', callback);
  } catch (e) {
    callback(e);
  }
}

console.log('Building dockerrun template...');

function deployToEb (zipPath) {
  const application = new EBApplication({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: 'us-east-1',
  });

  console.log('Pushing to Elastic Beanstalk...');

  application.deploy(createBeanstalkConfig({ zipPath, environmentName }))
  .then((data) => {
    console.log('Finished deployment!', data);
    return application.cleanApplicationVersions(applicationName);
  }, (error) => {
    console.error('An error occurred while deploying.');
    console.error(error);
    process.exit(1);
  });
}

function zipConfigs () {
  const zipPath = `./scripts/${applicationName}-gw2armoryapi:${new Date().getTime()}.zip`;

  const zip = new EasyZip();
  zip.addFile('Dockerrun.aws.json', './scripts/Dockerrun.aws.json', () => {
    zip.zipFolder('./scripts/.ebextensions', () => {
      zip.writeToFile(zipPath);
      deployToEb(zipPath);
    });
  });
}

readModuleFile('./Dockerrun.aws.json.mustache', (err, template) => {
  const data = {
    ENV: ENVIRONMENT,
    IMAGE_UPLOAD_ACCESS_KEY_ID,
    IMAGE_UPLOAD_SECRET_ACCESS_KEY,
    DATADOG_KEY,
    SES_ACCESS_KEY_ID: process.env.SES_ACCESS_KEY_ID,
    SES_SECRET_ACCESS_KEY: process.env.SES_SECRET_ACCESS_KEY,
    DATADOG_TAGS: environmentName,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    VERSION: process.env.VERSION || 'latest',
  };

  const output = mustache.render(template, data);

  const ws = fs.createWriteStream('./scripts/Dockerrun.aws.json');
  ws.write(output);

  console.log('Done!');

  zipConfigs();
});
