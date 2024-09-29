import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
  region: 'us-west-2',
});

export async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  const secret = response.SecretString;
  if (!secret) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return secret;
}

export async function updateSecret(
  secretName: string,
  secret: string
): Promise<void> {
  const command = new PutSecretValueCommand({
    SecretId: secretName,
    SecretString: secret,
  });
  await client.send(command);
}
