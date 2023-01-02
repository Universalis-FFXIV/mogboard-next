import { NextApiRequest, NextApiResponse } from 'next';
import { PHPObject } from '../../../../db/PHPObject';
import { Database } from '../../../../db';
import { UserListCustomType } from '../../../../types/universalis/user';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { unstable_getServerSession } from 'next-auth';
import { Body, createHandler, Put, Req, Res, ValidationPipe } from 'next-api-decorators';
import { IsInt, ArrayMaxSize } from 'class-validator';
import { FavouritesList, USER_LIST_MAX_ITEMS } from '../../../../db/user-list';

class AddFaveDTO {
  @IsInt({ each: true })
  @ArrayMaxSize(USER_LIST_MAX_ITEMS)
  items!: number[];
}

class FavesHandler {
  @Put()
  async addFave(
    @Body(ValidationPipe) body: AddFaveDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const itemsBody = body.items;
    const items = new PHPObject();
    items.push(...itemsBody);

    try {
      const faves = await Database.getUserListCustom(
        session.user.id,
        UserListCustomType.Favourites
      );

      if (faves == null) {
        await Database.createUserList(FavouritesList(uuidv4(), session.user.id, items));
      } else {
        await Database.updateUserListItems(session.user.id, faves.id, items);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }
}

export default createHandler(FavesHandler);
