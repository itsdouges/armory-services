var EBApplication = require('beanstalkify');
var mustache = require('mustache');
var fs = require('fs');
var EasyZip = require('easy-zip').EasyZip;
var hashFiles = require('hash-files');

var ENVIRONMENT = process.env.ENV;
var ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
var SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

if (!ENVIRONMENT) {
	throw 'Environment variable "ENV" is not defined.';
}

if (!ACCESS_KEY_ID) {
    throw 'Environment variable "ACCESS_KEY_ID" is not defined.';
}

if (!SECRET_ACCESS_KEY) {
    throw 'Environment variable "SECRET_ACCESS_KEY" is not defined.';
}

console.log('Starting deployment for ' + ENVIRONMENT + '!!');

function readModuleFile (path, callback) {
    try {
        var filename = require.resolve(path);
        fs.readFile(filename, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}

console.log('Building dockerrun template');

readModuleFile('./Dockerrun.aws.json.mustache', function (err, template) {
    var data = {
        ENV: ENVIRONMENT
    };

	var output = mustache.render(template, data);

	var ws = fs.createWriteStream('./deploy/Dockerrun.aws.json');
	ws.write(output);

    console.log('Done!');

    var applicationName = 'gw2armory-api';
    var environmentName = 'gw2armory-api-' + ENVIRONMENT.toLowerCase();
    var datetime = new Date();

    zipConfigs(applicationName, environmentName, datetime);
});

function zipConfigs (applicationName, environmentName, datetime) {
    var zipPath = './deploy/' + applicationName + '-gw2armoryapi:' + new Date().getTime() + '.zip';

    var zip = new EasyZip();
    zip.addFile('Dockerrun.aws.json', './deploy/Dockerrun.aws.json', function () {
        zip.zipFolder('./deploy/.ebextensions', function () {
            zip.writeToFile(zipPath);
            deployToEb(zipPath, environmentName);
        });
    });
}

function deployToEb (zipPath, environmentName) {
    var application = new EBApplication({
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: 'us-west-2'
    });

    console.log('Pushing to EB');

    application.deploy({
        archiveFilePath: zipPath,
        environmentName: environmentName,
        awsStackName: '64bit Amazon Linux 2015.03 v2.0.4 running Multi-container Docker 1.7.1 (Generic)',
        // http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html
        beanstalkConfig: [
        {
            Namespace: 'aws:autoscaling:asg',
            OptionName: 'Availability Zones',
            Value: 'Any 1'
        }, 
        {
            Namespace: 'aws:autoscaling:asg',
            OptionName: 'Availability Zones',
            Value: 'Any 1'
        }, 
        {
            Namespace: 'aws:autoscaling:asg',
            OptionName: 'MinSize',
            Value: '1'
        }, 
        {
            Namespace: 'aws:autoscaling:asg',
            OptionName: 'MaxSize',
            Value: '1'
        }, 
        {
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'EC2KeyName',
            Value: 'svc_deploy'
        }, 
        {
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'IamInstanceProfile',
            Value: 'aws-elasticbeanstalk-ec2-role'
        },
        {
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'InstanceType',
            Value: 't2.micro'
        },
        {
            Namespace: 'aws:ec2:vpc',
            OptionName: 'VPCId',
            Value: 'vpc-347a2f51'
        },
        {
            Namespace: 'aws:ec2:vpc',
            OptionName: 'AssociatePublicIpAddress',
            Value: 'true'
        },
        {
            Namespace: 'aws:ec2:vpc',
            OptionName: 'Subnets',
            Value: 'subnet-6a3d670f,subnet-79e79e0e,subnet-8072e1d9'
        },
        {
            Namespace: 'aws:elasticbeanstalk:application',
            OptionName: 'Application Healthcheck URL',
            Value: '/'
        },
        {
            Namespace: 'aws:elb:listener',
            OptionName: 'ListenerProtocol',
            Value: 'HTTP' // Change to https when prod.
        },
        {
            Namespace: 'aws:elasticbeanstalk:sns:topics',
            OptionName: 'Notification Protocol',
            Value: 'email'
        },
        {
            Namespace: 'aws:elasticbeanstalk:sns:topics',
            OptionName: 'Notification Endpoint',
            Value: 'laheen@gmail.com'
        }]
    }).then(function (data) {
        console.log(data);
        console.log('Finished deployment!');
    });
}