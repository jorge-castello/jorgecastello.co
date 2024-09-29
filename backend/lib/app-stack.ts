import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('functions'),
    });
  }
}
