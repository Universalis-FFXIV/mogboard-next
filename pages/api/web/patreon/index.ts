import type { NextApiRequest, NextApiResponse } from 'next';
import { createHandler, Get, Req, Res } from 'next-api-decorators';
import {
  getPatreonSubscribers,
  getRandomSubscriber,
  PatreonSubscriber,
} from '../../../../service/patreon';
import { Logger } from '../../../../service/logger';

const PatreonLogger = Logger.child({ location: '/api/web/patreon' });

export interface PatreonRandomSubscriberResponse {
  subscriber: PatreonSubscriber | null;
}

class PatreonHandler {
  @Get()
  async getRandomSubscriber(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    try {
      const subscribers = await getPatreonSubscribers();
      const randomSubscriber = getRandomSubscriber(subscribers);

      const response: PatreonRandomSubscriberResponse = {
        subscriber: randomSubscriber
          ? {
              name: randomSubscriber.name,
            }
          : null,
      };

      // Add cache headers for client-side caching (1 minute)
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

      return res.json(response);
    } catch (error) {
      PatreonLogger.error('Error in Patreon API endpoint', { error });

      // Return fallback response
      const fallbackResponse: PatreonRandomSubscriberResponse = {
        subscriber: null,
      };

      return res.status(500).json(fallbackResponse);
    }
  }
}

export default createHandler(PatreonHandler);
