import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.addWhoopSync();
  }

  /**
   * Adds the supporting infrastructure to upload Whoop data to my blog.
   * This method creates a Lambda function that syncs Whoop data and
   * sets up an EventBridge rule to trigger the Lambda every 5 minutes.
   */
  private addWhoopSync(): void {
    // Create the Lambda function
    const whoopSyncLambda = new lambda.Function(this, 'WhoopSyncLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'whoopSync.handler',
      code: lambda.Code.fromAsset('functions'),
    });

    // Create an EventBridge rule to trigger the Lambda every 5 minutes
    new events.Rule(this, 'WhoopSyncScheduleRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(whoopSyncLambda)],
    });
  }
}
