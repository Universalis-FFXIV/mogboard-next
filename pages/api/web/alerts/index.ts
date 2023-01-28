import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { Body, createHandler, Get, Post, Req, Res, ValidationPipe } from 'next-api-decorators';
import { UserAlert } from '../../../../types/universalis/user';
import { AlertDTO } from '../../../../service/validation';
import { v4 as uuidv4 } from 'uuid';
import { USER_ALERT_MAX } from '../../../../db/user-alert';

class AlertsHandler {
  @Post()
  async createAlert(
    @Body(ValidationPipe) body: AlertDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    // Ensure the user can create more alerts
    try {
      const alerts = await Database.getUserAlerts(session.user.id);
      if (alerts.length >= USER_ALERT_MAX) {
        return res.status(400).json({ message: 'Maximum number of alerts has been created.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    // Create the alert
    const alert: UserAlert = {
      id: uuidv4(),
      userId: session.user.id,
      itemId: body.itemId,
      worldId: body.worldId,
      discordWebhook: body.discordWebhook,
      triggerVersion: body.triggerVersion,
      trigger: body.trigger,
    };

    try {
      await Database.createUserAlert(alert);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(alert);
  }

  @Get()
  async fetchAlerts(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
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
