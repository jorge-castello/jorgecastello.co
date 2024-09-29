import * as cdk from 'aws-cdk-lib';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AppStage } from './app-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'WebsiteBackendPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'jorge-castello/jorgecastello.co',
          'main'
        ),
        commands: [
          'cd backend', // Navigate to the backend directory
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
        primaryOutputDirectory: 'backend/cdk.out', // Specify the output directory
      }),
    });

    pipeline.addStage(new AppStage(this, 'Deploy'));
  }
}
