import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as path from "path";
import { createZipFile } from "./utils/zipUtil";
import { getEnvVariables } from "./utils/envVariables";
import { createIamInstanceProfile } from "./utils/iamRoles";

// Configuration
const config = new pulumi.Config();
const appName = config.require("appName");
const appEnvironment = config.require("appEnvironment");
const appPort = config.require("appPort");
const dbPort = config.require("dbPort");
const dbUsername = config.require("dbUsername");
const dbPassword = config.require("dbPassword");
const dbName = config.require("dbName");
const dbSSL = config.require("dbSSL");

// Create the zip file
const sourceDir = path.join(__dirname, "..");
const outPath = `../${appName}.zip`;

createZipFile(sourceDir, outPath, appName)
  .then(() => {
    // STEP 0: VPC
    const vpc = new awsx.ec2.Vpc(`${appName}-vpc`);

    // STEP 1: S3 Bucket
    const bucket = new aws.s3.Bucket(`${appName}-s3Bucket`);
    // Upload the Elastic Beanstalk Application source bundle to S3
    const appSourceBundle = new aws.s3.BucketObject(`${appName}-appSourceBundle`, {
      bucket: bucket.id,
      key: `${appName}.zip`,
      source: new pulumi.asset.FileAsset(outPath),
    });

    // STEP 2: Setup IamInstanceProfile for EC2
    const instanceProfile = createIamInstanceProfile(appName);

    // STEP 3: Elastic Beanstalk Application and Application Version
    const app = new aws.elasticbeanstalk.Application(`${appName}-service`, {
      name: `${appName}-service`,
    });
    const appVersion = new aws.elasticbeanstalk.ApplicationVersion("appVersion", {
      application: app.name,
      description: "v1",
      bucket: bucket.id,
      key: appSourceBundle.id,
    });

    // Create RDS Security Group
    const rdsSecurityGroup = new aws.ec2.SecurityGroup(`${appName}-rds-sg`, {
      name: `${appName}-rds-sg`,
      description: "Security group for RDS instance",
      vpcId: vpc.vpcId,
      ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        {
          protocol: "tcp",
          fromPort: parseInt(dbPort, 10),
          toPort: parseInt(dbPort, 10),
          cidrBlocks: [vpc.vpc.cidrBlock],
        },
      ],
      egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    });

    const dbSubnets = new aws.rds.SubnetGroup("dbsubnets", {
      subnetIds: vpc.privateSubnetIds,
    });

    // Create RDS PostgreSQL instance
    const rdsInstance = new aws.rds.Instance(`${appName}-rds`, {
      engine: "postgres",
      instanceClass: "db.t3.micro",
      allocatedStorage: 20,
      dbName: dbName,
      username: dbUsername,
      password: dbPassword,
      port: parseInt(dbPort, 10),
      skipFinalSnapshot: true,
      publiclyAccessible: false,
      dbSubnetGroupName: dbSubnets.name,
      vpcSecurityGroupIds: [rdsSecurityGroup.id],
    });

    // STEP 4: Elastic Beanstalk Environment
    const ebEnvironment = new aws.elasticbeanstalk.Environment(`${appEnvironment}-${appName}`, {
      name: `${appEnvironment}-${appName}`,
      application: app.name,
      solutionStackName: "64bit Amazon Linux 2 v5.9.6 running Node.js 18",
      version: appVersion,
      settings: [
        {
          name: "VPCId",
          namespace: "aws:ec2:vpc",
          value: vpc.vpcId,
        },
        {
          name: "Subnets",
          namespace: "aws:ec2:vpc",
          value: vpc.publicSubnetIds[0],
        },
        {
          name: "IamInstanceProfile",
          namespace: "aws:autoscaling:launchconfiguration",
          value: instanceProfile.name,
        },
        {
          name: "SecurityGroups",
          namespace: "aws:autoscaling:launchconfiguration",
          value: rdsSecurityGroup.id,
        },
        ...getEnvVariables(rdsInstance, dbPort, dbUsername, dbPassword, dbName, dbSSL, appPort),
      ],
      waitForReadyTimeout: "15m",
    });
  })
  .catch((err) => {
    console.error("Error creating zip file:", err);
  });
