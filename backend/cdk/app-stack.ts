import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { getSyncWhoopToBlogSecrets } from '../functions/lib/aws/secrets';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.addSyncWhoopToBlog();
  }

  /**
   * Adds the supporting infrastructure to upload Whoop data to my blog.
   * This method creates a Lambda function that syncs Whoop data and
   * sets up an EventBridge rule to trigger the Lambda every 5 minutes.
   */
  private addSyncWhoopToBlog(): void {
    // Create the Lambda function
    const syncWhoopToBlogLambda = new lambda.Function(
      this,
      'SyncWhoopToBlogLambda',
      {
        functionName: 'SyncWhoopToBlogLambda',
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(3),
        handler: 'sync-whoop-to-blog.handler',
        code: lambda.Code.fromAsset('functions'),
      }
    );

    for (const importedSecret of getSyncWhoopToBlogSecrets()) {
      const secret = secretsmanager.Secret.fromSecretNameV2(
        this,
        importedSecret,
        importedSecret
      );

      secret.grantRead(syncWhoopToBlogLambda);
      secret.grantWrite(syncWhoopToBlogLambda);
    }

    // Create an EventBridge rule to trigger the Lambda every 5 minutes
    new events.Rule(this, 'SyncWhoopToBlogScheduleRule', {
      ruleName: 'SyncWhoopToBlogScheduleRule',
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(syncWhoopToBlogLambda)],
    });
  }
}
