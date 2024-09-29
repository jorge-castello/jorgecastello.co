import { getWhoopAccessToken } from './authenticate-with-whoop';
import { DailyWhoopData, WhoopData } from './whoop-data';

const WHOOP_API_BASE_URL = 'https://api.prod.whoop.com/developer/v1';

export async function getWhoopData(): Promise<WhoopData> {
  const accessToken = await getWhoopAccessToken();

  const [recoveryScores, sleepScores, strainScores] = await Promise.all([
    getWhoopRecoveryScores(accessToken),
    getWhoopSleepScores(accessToken),
    getWhoopStrainScores(accessToken),
  ]);

  const [mostRecentRecovery, nextToMostRecentRecovery] = recoveryScores.records;
  const [mostRecentSleep, nextToMostRecentSleep] = sleepScores.records;
  const [mostRecentStrain, nextToMostRecentStrain] = strainScores.records;

  const today = extractWhoopData(
    mostRecentRecovery,
    mostRecentSleep,
    mostRecentStrain
  );
  const yesterday = extractWhoopData(
    nextToMostRecentRecovery,
    nextToMostRecentSleep,
    nextToMostRecentStrain
  );

  return { today, yesterday };
}

async function getWhoopRecoveryScores(accessToken: string) {
  const response = await fetch(`${WHOOP_API_BASE_URL}/recovery`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

async function getWhoopSleepScores(accessToken: string) {
  const response = await fetch(`${WHOOP_API_BASE_URL}/activity/sleep`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

async function getWhoopStrainScores(accessToken: string) {
  const response = await fetch(`${WHOOP_API_BASE_URL}/cycle`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

function extractWhoopData(
  recovery: any,
  sleep: any,
  strain: any
): DailyWhoopData {
  const date = new Date(recovery.created_at);
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    id: recovery.cycle_id,
    date: formattedDate,
    recoveryScore: recovery.score.recovery_score,
    sleepScore: sleep.score.sleep_performance_percentage,
    strainScore: Number(strain.score.strain.toFixed(1)),
  };
}
