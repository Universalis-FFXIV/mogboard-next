import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { createHandler, Get, Req, Res } from 'next-api-decorators';
import { UserAlert } from '../../../../types/universalis/user';

class AlertsHandler {
  @Get()
  async getAlerts(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    // Fetch the user's alerts
    const alerts: UserAlert[] = [];
    try {
      const userAlerts = await Database.getUserAlerts(session.user.id);
      alerts.push(...userAlerts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(alerts);
  }
}

export default createHandler(AlertsHandler);
