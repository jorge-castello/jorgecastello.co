import { getWhoopData } from './lib/whoop/get-whoop-data';

export async function handler(event: any) {
  console.log('Syncing Whoop data...');

  const whoopData = await getWhoopData();
  console.log({ whoopData });

  return {
    statusCode: 200,
    body: whoopData,
  };
}
