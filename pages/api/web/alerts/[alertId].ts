import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { Body, createHandler, Put, Query, Req, Res, ValidationPipe } from 'next-api-decorators';
import { IsUUID } from 'class-validator';
import { AlertDTO } from '../../../../service/validation';

class UpdateAlertQueryDTO {
  @IsUUID(4)
  alertId!: string;
}

class AlertsHandler {
  @Put()
  async updateAlert(
    @Body(ValidationPipe) body: AlertDTO,
    @Query(ValidationPipe) query: UpdateAlertQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { alertId } = query;
    try {
      await Database.updateUserAlert({ id: alertId, userId: session.user.id, ...body });
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
