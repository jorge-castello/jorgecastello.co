import { publishToBlog } from './lib/ghost/publish-whoop-data';
import { getWhoopData } from './lib/whoop/get-whoop-data';

export async function handler(event: any) {
  const whoopData = await getWhoopData();
  await publishToBlog(whoopData);

  return {
    statusCode: 200,
    body: whoopData,
  };
}
