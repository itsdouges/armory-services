module.exports = ({ zipPath, environmentName }) => ({
  archiveFilePath: zipPath,
  environmentName,
  // eslint-disable-next-line
  awsStackName: '64bit Amazon Linux 2016.09 v2.3.0 running Multi-container Docker 1.11.2 (Generic)',
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
    Value: 'LoadBalanced',
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
});
