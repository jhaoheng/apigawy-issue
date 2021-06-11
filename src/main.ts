import * as cdk from '@aws-cdk/core';
import { SetApiGateway } from './apigateway'
import { SetRoute53 } from './route53'
import { SetApiLambda } from './lambda'
import * as ec2 from '@aws-cdk/aws-ec2'

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    cdk.Tags.of(this).add(
      "Test","test",{}
    )

    //
    const FamilyName = cdk.Stack.of(this).stackName
    const DomainName = ""
    const SubDomainName = ""
    const VpcId = ""
    const SubnetId = ""
    const SourceIps = [""]

    //
    const Vpc = ec2.Vpc.fromLookup(this, `mobilepush-setLambdaVpc`, {
      vpcId: VpcId,
    })
    const VpcSubnet = ec2.Subnet.fromSubnetAttributes(this, `mobilepush-setLambdaSubnet`, {
      subnetId: SubnetId,
    })
    
    //
    const myLambdaStack = new SetApiLambda(this, "myLambda", {
      FamilyName,
      Vpc,
      VpcSubnets: [
        VpcSubnet
      ]
    })

    //
    const myApiGatewayStack = new SetApiGateway(this, `myApiGateway`, {
      FamilyName,
      DomainName,
      SubDomainName,
      MyLambdaFunc: myLambdaStack.ApiLambdaFunc,
      SourceIps
    })

    //
    new SetRoute53(this, `myRoute53`, {
      FamilyName,
      DomainName,
      SubDomainName,
      MyApiGateway: myApiGatewayStack.MyApiGateway
    })
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();