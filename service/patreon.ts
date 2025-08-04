import { patreon, Patron, Pledge, Campaign } from 'patreon';
import { MogboardCacheItem } from './cache';
import { Logger } from './logger';

export const PatreonLogger = Logger.child({ location: 'service/patreon' });

export interface PatreonSubscriber {
  name: string;
}

interface PatreonCache {
  subscribers?: MogboardCacheItem<PatreonSubscriber[]>;
}

const patreonCache: PatreonCache = {};
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function isCacheValid<T>(cacheItem: MogboardCacheItem<T> | undefined): boolean {
  return cacheItem !== undefined && Date.now() - cacheItem.cachedAt.getTime() < CACHE_DURATION_MS;
}

export async function getPatreonSubscribers(): Promise<PatreonSubscriber[]> {
  // Check cache first
  if (isCacheValid(patreonCache.subscribers)) {
    return patreonCache.subscribers!.value;
  }

  const accessToken = process.env.PATREON_ACCESS_TOKEN;

  // Fallback behavior for development
  if (!accessToken) {
    PatreonLogger.warn('Patreon credentials not configured, returning empty subscribers list');
    const fallbackData: PatreonSubscriber[] = [];
    patreonCache.subscribers = {
      value: fallbackData,
      cachedAt: new Date(),
    };
    return fallbackData;
  }

  try {
    const patreonClient = patreon(accessToken);

    // Get current user to find their campaign
    const currentUserResponse = await patreonClient('/current_user');
    const campaigns = currentUserResponse.store.findAll('campaign') as Campaign[];

    if (campaigns.length === 0) {
      throw new Error('No campaigns found');
    }

    const campaignId = campaigns[0].id;

    // Get all pledges for the campaign with pagination
    const subscribers: PatreonSubscriber[] = [];
    let nextUrl:
      | string
      | null = `/campaigns/${campaignId}/pledges?include=patron&fields[user]=full_name&page[count]=100`;

    while (nextUrl) {
      const pledgesResponse = await patreonClient(nextUrl);
      const pledges = pledgesResponse.store.findAll('pledge') as Pledge[];

      // Extract active subscribers from this page
      for (const pledge of pledges) {
        // Only include active pledges (not declined)
        if (!pledge.declined_since) {
          const patronId = pledge.patron?.id;
          if (!patronId) continue;

          const patron = pledgesResponse.store.find('user', patronId) as Patron;

          if (patron) {
            subscribers.push({
              name: (patron.discord_vanity || patron.full_name).trim(),
            });
          }
        }
      }

      // Check for next page via cursor
      const cursors = (pledgesResponse as any).meta?.pagination?.cursors;
      if (cursors?.next) {
        nextUrl =
          `/campaigns/${campaignId}/pledges` +
          `?include=patron&fields[user]=full_name` +
          `&page[count]=100&page[cursor]=${cursors.next}`;
      } else {
        nextUrl = null;
      }
    }

    // Cache the result
    patreonCache.subscribers = {
      value: subscribers,
      cachedAt: new Date(),
    };

    return subscribers;
  } catch (err) {
    PatreonLogger.error(err);

    // Return cached data if available, even if expired
    if (patreonCache.subscribers) {
      PatreonLogger.warn('Returning expired cache due to API error');
      return patreonCache.subscribers.value;
    }

    // Otherwise return empty array
    return [];
  }
}

export function getRandomSubscriber(subscribers: PatreonSubscriber[]): PatreonSubscriber | null {
  if (subscribers.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * subscribers.length);
  return subscribers[randomIndex];
}
