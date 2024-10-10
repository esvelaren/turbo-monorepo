import * as aws from "@pulumi/aws";

export function getEnvVariables(
  rdsInstance: aws.rds.Instance,
  dbPort: string,
  dbUsername: string,
  dbPassword: string,
  dbName: string,
  dbSSL: string,
  appPort: string
) {
  return [
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_HOST",
      value: rdsInstance.endpoint.apply((endpoint) => endpoint.split(":")[0]),
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_PORT",
      value: dbPort,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_USER",
      value: dbUsername,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_PASSWORD",
      value: dbPassword,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_DATABASE",
      value: dbName,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "POSTGRES_SSL_ENABLED",
      value: dbSSL,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "PORT",
      value: appPort,
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "RUN_MIGRATIONS",
      value: "false",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "JWT_SECRET",
      value: "Secret",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "SEED_ORGANIZATION_NAME",
      value: "Altheria",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "SEED_ADMIN_USERNAME",
      value: "demo@altheria-solutions.com",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "SEED_ADMIN_PASSWORD",
      value: "OceanShield01!",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "BCRYPT_SALT_ROUNDS",
      value: "10",
    },
    {
      namespace: "aws:elasticbeanstalk:application:environment",
      name: "STORAGE_ROOT",
      value: "/mnt/efs/",
    },
  ];
}
