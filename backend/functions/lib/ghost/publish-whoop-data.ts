import {
  GHOST_ADMIN_API_KEY_SECRET_NAME,
  GHOST_CONTENT_API_KEY_SECRET_NAME,
} from '../aws/secrets';
import { getSecret } from '../aws/secrets-manager';
import { DailyWhoopData, WhoopData } from '../whoop/whoop-data';
import GhostAdminAPI from '@tryghost/admin-api';

const GHOST_API_URL = 'https://jorge-castello.ghost.io';

interface BlogPost {
  id?: string;
  html: string;
  slug: string;
  status: string;
  title: string;
  updated_at?: string;
}

const getGhostContentUrl = (slug: string, key: string) =>
  `${GHOST_API_URL}/ghost/api/content/posts/slug/${slug}?key=${key}`;

export async function publishToBlog(data: WhoopData) {
  const ghostAdminApiKey = await getSecret(GHOST_ADMIN_API_KEY_SECRET_NAME);
  const api = new GhostAdminAPI({
    url: GHOST_API_URL,
    key: ghostAdminApiKey,
    version: 'v5.0',
  });

  const yesterdayPost = getBlogPost(data.yesterday);
  const todayPost = getBlogPost(data.today);

  await publishPost(api, yesterdayPost);
  await publishPost(api, todayPost);
}

function getBlogPost(whoopData: DailyWhoopData): BlogPost {
  const html = `
  <ul>
      <li>Recovery Score: ${whoopData.recoveryScore}</li>
      <li>Sleep Score: ${whoopData.sleepScore}</li>
      <li>Strain Score: ${whoopData.strainScore}</li>
  </ul>
  `;

  const slug = 'whoop-data-' + whoopData.id;

  return {
    html,
    slug,
    status: 'published',
    title: 'Whoop Data - ' + whoopData.date,
  };
}

async function publishPost(api: any, post: BlogPost) {
  const options = { source: 'html' };
  try {
    // Try to read the post by slug
    const ghostContentKey = await getSecret(GHOST_CONTENT_API_KEY_SECRET_NAME);
    const ghostContentUrl = getGhostContentUrl(post.slug, ghostContentKey);

    const existingPostCall = await fetch(ghostContentUrl);
    const responseData = await existingPostCall.json();

    if (responseData.errors && existingPostCall.status !== 404) {
      const errorMessage =
        responseData.errors[0]?.message || 'Unknown API error';

      throw new Error(`Ghost API error: ${errorMessage}`);
    }

    if (!responseData.posts || responseData.posts.length === 0) {
      // Post doesn't exist, create a new one
      const newPost = await api.posts.add(post, options);
      console.log(`Post created: ${newPost.slug}`);
      return;
    }

    const existingPost = responseData.posts[0];

    // Check if the content has changed
    if (
      existingPost.html.replace(/\s+/g, '') !== post.html.replace(/\s+/g, '')
    ) {
      // Post exists and content has changed, update it
      post.id = existingPost.id;
      post.updated_at = existingPost.updated_at;

      const updatedPost = await api.posts.edit(post, options);
      console.log(`Post updated: ${updatedPost.id}`);
    } else {
      console.log(
        `No changes detected for post: ${existingPost.id}. Skipping update.`
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in publishPost:', error.message);
      // You might want to handle different types of errors differently here
      throw error;
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred');
    }
  }
}
