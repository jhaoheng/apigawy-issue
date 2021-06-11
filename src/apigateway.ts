import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam'

export interface SetApiGatewayProps {
    FamilyName: string;
    DomainName: string;
    SubDomainName: string;
    MyLambdaFunc: lambda.Function;
    SourceIps: string[];
}

export class SetApiGateway extends cdk.Construct {

    public readonly MyApiGateway: apigateway.RestApi;

    constructor(scope: cdk.Construct, id: string, props: SetApiGatewayProps) {
        super(scope, id);

        //        
        this.MyApiGateway = new apigateway.RestApi(this, 'myApiGateway', {
            restApiName: `${props.FamilyName}`,
            description: `${props.FamilyName}`,
            endpointTypes: [
                apigateway.EndpointType.REGIONAL,
            ],
            domainName: {
                domainName: `${props.SubDomainName}.${props.DomainName}`,
                endpointType: apigateway.EndpointType.REGIONAL,
                certificate: new acm.Certificate(this, 'Cert', {
                    domainName: `${props.SubDomainName}.${props.DomainName}`,
                    validation: acm.CertificateValidation.fromDns(),
                }),
            },
            failOnWarnings: true,
            binaryMediaTypes: [
                "application/octet-stream",
                "multipart/form-data",
                "image/jpeg",
                "image/png"
            ],
            policy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        principals: [
                            new iam.AnyPrincipal()
                        ],
                        actions: ['execute-api:Invoke'],
                        resources: [`arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:*/*/*/*`],
                        conditions: {
                            "IpAddress": { "aws:SourceIp": props.SourceIps }
                        }
                    }),
                ]
            })
        });
        
        // api::mytest
        const api_mytest = this.MyApiGateway.root.addResource('mytest');
        const api_mytest_integration = new apigateway.LambdaIntegration(props.MyLambdaFunc, {
            proxy: true,
        });
        api_mytest.addMethod('POST', api_mytest_integration, {
        });

        // api::root
        this.MyApiGateway.root.addMethod(
            'GET',
            new apigateway.MockIntegration({
                passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
                requestTemplates: {
                    'application/json': '{ "statusCode": 200 }',
                },
                integrationResponses: [
                    { statusCode: '200' },
                ],
            }), {
            methodResponses: [
                { statusCode: '200' },
            ],
            apiKeyRequired: true,
        });
    }
}