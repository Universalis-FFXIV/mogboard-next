import { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { PHPObject } from '../../../../db/PHPObject';
import { unix } from '../../../../db/util';
import { UserList, UserListCustomType } from '../../../../types/universalis/user';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { USER_LIST_MAX, USER_LIST_MAX_ITEMS } from '../../../../db/user-list';
import { unstable_getServerSession } from 'next-auth';
import { Body, createHandler, Get, Post, Req, Res, ValidationPipe } from 'next-api-decorators';
import { ArrayMaxSize, IsInt, MaxLength, MinLength } from 'class-validator';

class CreateListDTO {
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsInt({ each: true })
  @ArrayMaxSize(USER_LIST_MAX_ITEMS)
  items!: number[];
}

class ListsHandler {
  @Get()
  async fetchLists(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    // Fetch the user's lists
    const lists: UserList[] = [];
    try {
      const userLists = await Database.getUserLists(session.user.id);
      lists.push(...userLists);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(lists);
  }

  @Post()
  async createList(
    @Body(ValidationPipe) body: CreateListDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    // Ensure the user can create more lists
    try {
      const lists = await Database.getUserLists(session.user.id);
      if (lists.length >= USER_LIST_MAX) {
        return res.status(400).json({ message: 'Maximum number of lists has been created.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    // Create the list
    const name = body.name;
    const items = new PHPObject();
    items.push(...body.items);

    const list: UserList = {
      id: uuidv4(),
      userId: session.user.id,
      added: unix(),
      updated: unix(),
      name,
      custom: false,
      customType: UserListCustomType.Default,
      items,
    };

    try {
      await Database.createUserList(list);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(list);
  }
}

export default createHandler(ListsHandler);
