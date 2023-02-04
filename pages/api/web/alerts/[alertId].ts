import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import {
  Body,
  createHandler,
  Delete,
  Put,
  Query,
  Req,
  Res,
  ValidationPipe,
} from 'next-api-decorators';
import { IsUUID } from 'class-validator';
import { AlertDTO } from '../../../../service/validation';

class AlertQueryDTO {
  @IsUUID(4)
  alertId!: string;
}

class AlertsHandler {
  @Put()
  async updateAlert(
    @Body(ValidationPipe) body: AlertDTO,
    @Query(ValidationPipe) query: AlertQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { alertId } = query;
    try {
      // Get the alert
      const alert = await Database.getUserAlert(session.user.id, alertId);
      if (alert == null) {
        return res.status(404).json({ message: 'The requested alert does not exist.' });
      }

      // Ensure the user is authorized to modify the alert
      const ownerId = alert.userId;
      if (ownerId !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }

      await Database.updateUserAlert({ id: alertId, userId: session.user.id, ...body });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }

  @Delete()
  async deleteUserAlert(
    @Query(ValidationPipe) query: AlertQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { alertId } = query;
    try {
      // Get the alert
      const alert = await Database.getUserAlert(session.user.id, alertId);
      if (alert == null) {
        return res.status(404).json({ message: 'The requested alert does not exist.' });
      }

      // Ensure the user is authorized to delete the alert
      const ownerId = alert.userId;
      if (ownerId !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }

      await Database.deleteUserAlert(session.user.id, alertId);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }
}

export default createHandler(AlertsHandler);
