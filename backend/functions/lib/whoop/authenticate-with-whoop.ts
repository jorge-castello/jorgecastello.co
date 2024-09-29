import {
  WHOOP_CLIENT_DETAILS_SECRET_NAME,
  WHOOP_REFRESH_TOKEN_SECRET_NAME,
} from '../aws/secrets';
import { getSecret, updateSecret } from '../aws/secrets-manager';

const WHOOP_TOKEN_ENDPOINT = 'https://api.prod.whoop.com/oauth/oauth2/token';

interface WhoopClientDetails {
  clientId: string;
  clientSecret: string;
}

interface WhoopTokens {
  access_token: string;
  refresh_token: string;
}

export async function getWhoopAccessToken(): Promise<string> {
  const refreshToken = await getSecret(WHOOP_REFRESH_TOKEN_SECRET_NAME);
  const clientDetails = await getClientDetails();

  const refreshParams = {
    grant_type: 'refresh_token',
    client_id: clientDetails.clientId,
    client_secret: clientDetails.clientSecret,
    scope: 'offline',
    refresh_token: refreshToken,
  };

  const tokens = await getFreshTokens(refreshParams);

  // Need to update the refresh token in Secrets Manager
  await updateSecret(WHOOP_REFRESH_TOKEN_SECRET_NAME, tokens.refresh_token);
  return tokens.access_token;
}

async function getClientDetails(): Promise<WhoopClientDetails> {
  const clientDetails = await getSecret(WHOOP_CLIENT_DETAILS_SECRET_NAME);
  return JSON.parse(clientDetails);
}

async function getFreshTokens(
  refreshParams: Record<string, string>
): Promise<WhoopTokens> {
  const refreshTokenResponse = await fetch(WHOOP_TOKEN_ENDPOINT, {
    body: new URLSearchParams(refreshParams),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!refreshTokenResponse.ok) {
    throw new Error(
      `Failed to refresh tokens: ${refreshTokenResponse.statusText}`
    );
  }

  return await refreshTokenResponse.json();
}
