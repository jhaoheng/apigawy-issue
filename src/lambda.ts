import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface SetApiLambdaProps {
    FamilyName: string;
    Vpc: ec2.IVpc,
    VpcSubnets: ec2.ISubnet[],
}

export class SetApiLambda extends cdk.Construct {

    public ApiLambdaFunc: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: SetApiLambdaProps) {
        super(scope, id);
        const role = this.set_role(props);

        // lambda func
        this.ApiLambdaFunc = this.set_api_lambda(props, role)
    }
    //
    private set_api_lambda(props: SetApiLambdaProps, role: iam.Role): lambda.Function {

        const myLambdaSecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: props.Vpc,
            description: 'Allow ssh access to ec2 instances',
            allowAllOutbound: true   // Can be set to false
        });
        myLambdaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'allow ssh access from the world')

        return new lambda.Function(this, 'SchduleApiLambda', {
            functionName: `${props.FamilyName}_SchduleApiLambda`,
            runtime: lambda.Runtime.GO_1_X,
            handler: 'main',
            code: lambda.Code.fromAsset(path.join(__dirname + '/../', 'lambda-handler/api'), {
                bundling: {
                    user: "root",
                    image: lambda.Runtime.GO_1_X.bundlingImage,
                    command: [
                        'bash', '-c', [
                            'go test -v',
                            'GOOS=linux go build -o /asset-output/main',
                        ].join(' && '),
                    ],
                },
            }),
            role: role,
            description: `${props.FamilyName}, create by cdk`,
            memorySize: 128,
            timeout: cdk.Duration.seconds(25),
            vpc: props.Vpc,
            vpcSubnets: props.Vpc.selectSubnets({
                subnets: props.VpcSubnets
            }),
            securityGroups: [
                myLambdaSecurityGroup,
            ],
        });
    }

    //
    private set_role(props: SetApiLambdaProps): iam.Role {
        //
        return new iam.Role(this, `${props.FamilyName}_Role`, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: `${props.FamilyName}_Role`,
            inlinePolicies: {
                SlefPolicies: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            actions: [
                                "logs:*",
                                "ec2:*",
                            ],
                            resources: ["*"],
                        }),
                    ],
                }),
            }
        });
    }
}