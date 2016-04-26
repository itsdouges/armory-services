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

var applicationName = 'gw2armory-api';
var environmentName = 'gw2armory-api-' + ENVIRONMENT.toLowerCase();

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
        region: 'us-east-1'
    });

    console.log('Pushing to EB');

    application.deploy({
        archiveFilePath: zipPath,
        environmentName: environmentName,
        awsStackName: '64bit Amazon Linux 2016.03 v2.1.0 running Multi-container Docker 1.9.1 (Generic)',
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
            Value: 'gw2armory-ssh'
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
            Value: 'vpc-7857f31c'
        },
        {
            Namespace: 'aws:ec2:vpc',
            OptionName: 'AssociatePublicIpAddress',
            Value: 'true'
        },
        {
            Namespace: 'aws:ec2:vpc',
            OptionName: 'Subnets',
            Value: 'subnet-851e20dc'
        },
        {
            Namespace: 'aws:elasticbeanstalk:application',
            OptionName: 'Application Healthcheck URL',
            Value: '/'
        },
        {
            Namespace : 'aws:elb:listener:443',
            OptionName : 'SSLCertificateId',
            Value : 'arn:aws:acm:us-east-1:521573301669:certificate/07c5ada9-db12-4e2d-ba97-69b36d41cf9e'
        },
        {
            Namespace: 'aws:elb:listener:443',
            OptionName: 'ListenerProtocol',
            Value: 'HTTPS'
        },
        {
            Namespace : 'aws:elb:listener:443',
            OptionName : 'InstancePort',
            Value : '80'
        },
        {
            Namespace : 'aws:elb:listener:443',
            OptionName : 'InstanceProtocol',
            Value : 'HTTP'
        },
        {
            Namespace : 'aws:elb:listener:80',
            OptionName : 'ListenerEnabled',
            Value : 'true'
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

        return application.cleanApplicationVersions(applicationName);
    }, function (error) {
        console.error('An error occurred deploying to elastic beanstalk.');
        console.error(error);
        process.exit(1);
    });
}