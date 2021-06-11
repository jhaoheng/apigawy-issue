import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as apigateway from '@aws-cdk/aws-apigateway';


export interface SetRoute53Props {
  FamilyName: string;
  DomainName: string;
  SubDomainName: string;
  MyApiGateway: apigateway.RestApi;
}

export class SetRoute53 extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: SetRoute53Props) {
    super(scope, id);

    // route53
    const hostedZone = route53.HostedZone.fromLookup(this, 'MyZone', {
      domainName: props.DomainName,
    })
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(props.MyApiGateway)),
      recordName: `${props.SubDomainName}.${props.DomainName}`,
    });
  }
}