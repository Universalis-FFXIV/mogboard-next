import { LodestoneWorldStatus } from 'lodestone-world-status';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createHandler, Get, Req, Res } from 'next-api-decorators';

interface WorldState {
  congested: boolean;
}

type GetLodestoneWorldsResponse = Record<string, WorldState>;

const status = new LodestoneWorldStatus();

class LodestoneWorldsHandler {
  @Get()
  async getLodestoneWorlds(@Req() _req: NextApiRequest, @Res() res: NextApiResponse) {
    const worldStatuses = await status.getAllWorldsFlat();
    const worldsResponse: GetLodestoneWorldsResponse = worldStatuses.reduce(
      (agg, next) => ({
        ...agg,
        [next.name]: {
          congested: next.population === 'congested',
        },
      }),
      {} as GetLodestoneWorldsResponse
    );
    return res.json(worldsResponse);
  }
}

export default createHandler(LodestoneWorldsHandler);
