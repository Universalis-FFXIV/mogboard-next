import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { NextApiRequest, NextApiResponse } from 'next';
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
import { unstable_getServerSession } from 'next-auth';
import { Database } from '../../../../db';
import { USER_LIST_MAX_ITEMS } from '../../../../db/user-list';
import { authOptions } from '../../auth/[...nextauth]';

class ToggleItemDTO {
  @IsIn(['add', 'remove'])
  action!: string;

  @IsInt()
  itemId!: number;
}

class UpdateListDTO {
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @Type(() => ToggleItemDTO)
  @ValidateNested()
  @IsOptional()
  item?: ToggleItemDTO;
}

class UpdateListQueryDTO {
  @IsUUID(4)
  listId!: string;
}

class DeleteListQueryDTO {
  @IsUUID(4)
  listId!: string;
}

class ListHandler {
  @Put()
  async updateList(
    @Body(ValidationPipe) body: UpdateListDTO,
    @Query(ValidationPipe) query: UpdateListQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { listId } = query;
    const { name, item } = body;

    try {
      // Get the list
      const list = await Database.getUserList(listId);
      if (list == null) {
        return res.status(404).json({ message: 'The requested list does not exist.' });
      }

      // Ensure the user is authorized to modify the list
      if (list.userId !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }

      // Update the list name, if desired
      if (name != null) {
        await Database.updateUserListName(session.user.id, listId, name);
      }

      // Update the list items, if desired
      if (item != null) {
        if (item.action === 'add' && !list.items.includes(item.itemId)) {
          list.items.unshift(item.itemId);

          if (list.items.length > USER_LIST_MAX_ITEMS) {
            return res.status(441).json({ message: 'List is at maximum capacity.' });
          }

          await Database.updateUserListItems(session.user.id, listId, list.items);
        } else if (item.action === 'remove' && list.items.includes(item.itemId)) {
          list.items.splice(list.items.indexOf(item.itemId), 1);

          await Database.updateUserListItems(session.user.id, listId, list.items);
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }

  @Delete()
  async deleteList(
    @Query(ValidationPipe) query: DeleteListQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { listId } = query;

    try {
      // Get the list
      const list = await Database.getUserList(listId);
      if (list == null) {
        return res.status(404).json({ message: 'The requested list does not exist.' });
      }

      // Ensure the user is authorized to modify the list
      const ownerId = list.userId;
      if (ownerId !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }

      // Make sure the list isn't a system list
      if (list.custom) {
        return res.status(440).json({ message: 'You may not delete special lists.' });
      }

      await Database.deleteUserList(session.user.id, listId);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }
}

export default createHandler(ListHandler);
