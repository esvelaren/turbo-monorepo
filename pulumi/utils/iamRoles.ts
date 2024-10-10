import * as aws from "@pulumi/aws";

export function createIamInstanceProfile(appName: string) {
  // Create IAM Role
  const instanceProfileRole = new aws.iam.Role(`${appName}-eb-ec2-role`, {
    name: `${appName}-eb-ec2-role`,
    description: "Role for EC2 managed by EB",
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sts:AssumeRole",
          Principal: {
            Service: "ec2.amazonaws.com",
          },
          Effect: "Allow",
          Sid: "",
        },
      ],
    }),
  });

  // Attach the policies for the IAM Instance Profile
  new aws.iam.RolePolicyAttachment(`${appName}-role-policy-attachment-ec2-ecr`, {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  });
  new aws.iam.RolePolicyAttachment(`${appName}-role-policy-attachment-web`, {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier",
  });
  new aws.iam.RolePolicyAttachment(`${appName}-role-policy-attachment-worker`, {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier",
  });

  // Create Instance Profile
  const instanceProfile = new aws.iam.InstanceProfile(`${appName}-eb-ec2-instance-profile`, {
    role: instanceProfileRole.name,
  });

  return instanceProfile;
}
