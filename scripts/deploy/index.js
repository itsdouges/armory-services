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

const applicationName = 'gw2armory-api';
const environmentName = `gw2armory-api-${ENVIRONMENT.toLowerCase()}`;

console.log(`Deploying ${environmentName}...`);

function readModuleFile (path, callback) {
  try {
    var filename = require.resolve(path);
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

  application.deploy({
    archiveFilePath: zipPath,
    environmentName,
    // eslint-disable-next-line
    awsStackName: '64bit Amazon Linux 2016.03 v2.1.0 running Multi-container Docker 1.9.1 (Generic)',
    // http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html
    beanstalkConfig: [{
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'Availability Zones',
      Value: 'Any 1',
    },
    {
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'Availability Zones',
      Value: 'Any 1',
    },
    {
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'MinSize',
      Value: '1',
    },
    {
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'MaxSize',
      Value: '1',
    },
    {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'EC2KeyName',
      Value: 'gw2armory-ssh',
    },
    {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'IamInstanceProfile',
      Value: 'aws-elasticbeanstalk-ec2-role',
    },
    {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'InstanceType',
      Value: 't2.micro',
    },
    {
      Namespace: 'aws:ec2:vpc',
      OptionName: 'VPCId',
      Value: 'vpc-7857f31c',
    },
    {
      Namespace: 'aws:ec2:vpc',
      OptionName: 'AssociatePublicIpAddress',
      Value: 'true',
    },
    {
      Namespace: 'aws:ec2:vpc',
      OptionName: 'Subnets',
      Value: 'subnet-75f4db5e,subnet-e235d194,subnet-02e5363f,subnet-851e20dc',
    },
    {
      Namespace: 'aws:elasticbeanstalk:application',
      OptionName: 'Application Healthcheck URL',
      Value: '/',
    },
    {
      Namespace: 'aws:elb:listener:443',
      OptionName: 'SSLCertificateId',
      Value: 'arn:aws:acm:us-east-1:521573301669:certificate/07c5ada9-db12-4e2d-ba97-69b36d41cf9e',
    },
    {
      Namespace: 'aws:elb:listener:443',
      OptionName: 'ListenerProtocol',
      Value: 'HTTPS',
    },
    {
      Namespace: 'aws:elb:listener:443',
      OptionName: 'InstancePort',
      Value: '80',
    },
    {
      Namespace: 'aws:elb:listener:443',
      OptionName: 'InstanceProtocol',
      Value: 'HTTP',
    },
    {
      Namespace: 'aws:elb:listener:80',
      OptionName: 'ListenerEnabled',
      Value: 'true',
    },
    {
      Namespace: 'aws:elasticbeanstalk:sns:topics',
      OptionName: 'Notification Protocol',
      Value: 'email',
    },
    {
      Namespace: 'aws:elasticbeanstalk:sns:topics',
      OptionName: 'Notification Endpoint',
      Value: 'laheen@gmail.com',
    }],
  })
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
  const zipPath = `./scripts/deploy/${applicationName}-gw2armoryapi:${new Date().getTime()}.zip`;

  const zip = new EasyZip();
  zip.addFile('Dockerrun.aws.json', './scripts/deploy/Dockerrun.aws.json', () => {
    zip.zipFolder('./scripts/deploy/.ebextensions', () => {
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
    GITTER_API_KEY: process.env.GITTER_API_KEY,
  };

  const output = mustache.render(template, data);

  const ws = fs.createWriteStream('./scripts/deploy/Dockerrun.aws.json');
  ws.write(output);

  console.log('Done!');

  zipConfigs();
});
