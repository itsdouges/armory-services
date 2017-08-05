module.exports = ({ zipPath, environmentName }) => ({
  archiveFilePath: zipPath,
  environmentName,
  // eslint-disable-next-line max-len
  awsStackName: '64bit Amazon Linux 2017.03 v2.7.2 running Multi-container Docker 17.03.1-ce (Generic)',
  beanstalkConfig: [{
    Namespace: 'aws:autoscaling:asg',
    OptionName: 'Availability Zones',
    Value: 'Any 1',
  },
  {
    Namespace: 'aws:autoscaling:launchconfiguration',
    OptionName: 'EC2KeyName',
    Value: 'gw2a-api',
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
    OptionName: 'Subnets',
    Value: 'subnet-75f4db5e',
  },
  {
    Namespace: 'aws:elasticbeanstalk:application',
    OptionName: 'Application Healthcheck URL',
    Value: '/healthcheck',
  },
  {
    Namespace: 'aws:elasticbeanstalk:environment',
    OptionName: 'ServiceRole',
    Value: 'aws-elasticbeanstalk-service-role',
  },
  {
    Namespace: 'aws:elasticbeanstalk:environment',
    OptionName: 'EnvironmentType',
    Value: 'SingleInstance',
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
});
