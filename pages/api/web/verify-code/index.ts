import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { createHandler, Get, Req, Res } from 'next-api-decorators';

class VerifyCodeHandler {
  @Get()
  async getVerifyCode(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    return res.json({ code: Database.getUserAuthCode(session.user.id) });
  }
}

export default createHandler(VerifyCodeHandler);
