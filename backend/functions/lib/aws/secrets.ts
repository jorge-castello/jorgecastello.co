export const WHOOP_REFRESH_TOKEN_SECRET_NAME = 'whoop-refresh-token';
export const WHOOP_CLIENT_DETAILS_SECRET_NAME = 'whoop-client-details';
export const GHOST_ADMIN_API_KEY_SECRET_NAME = 'ghost-admin-api-key';

export const getSyncWhoopToBlogSecrets = () => [
  WHOOP_REFRESH_TOKEN_SECRET_NAME,
  WHOOP_CLIENT_DETAILS_SECRET_NAME,
  GHOST_ADMIN_API_KEY_SECRET_NAME,
];
