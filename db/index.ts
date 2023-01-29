import {
  User,
  UserAlert,
  UserCharacter,
  UserList,
  UserListCustomType,
} from '../types/universalis/user';
import { PHPObject } from './PHPObject';
import * as UserDatabase from './user';
import * as UserListDatabase from './user-list';
import * as UserCharacterDatabase from './user-character';
import * as UserAlertDatabase from './user-alert';
import { rentConnectionForFn } from './util';

export class Database {
  static createUser(user: User) {
    return rentConnectionForFn((conn) => UserDatabase.createUser(user, conn));
  }

  static updateUserBasic(id: string, username: string, email: string, avatar: string) {
    return rentConnectionForFn((conn) =>
      UserDatabase.updateUserBasic(id, username, email, avatar, conn)
    );
  }

  static updateUserDiscord(
    id: string,
    discordId: string,
    discordTokenExpires: number,
    discordTokenAccess: string,
    discordTokenRefresh: string
  ) {
    return rentConnectionForFn((conn) =>
      UserDatabase.updateUserDiscord(
        id,
        discordId,
        discordTokenExpires,
        discordTokenAccess,
        discordTokenRefresh,
        conn
      )
    );
  }

  static removeUserDiscord(discordId: string) {
    return rentConnectionForFn((conn) => UserDatabase.removeUserDiscord(discordId, conn));
  }

  static getUser(id: string) {
    return rentConnectionForFn((conn) => UserDatabase.getUser(id, conn));
  }

  static getUserByEmail(email: string) {
    return rentConnectionForFn((conn) => UserDatabase.getUserByEmail(email, conn));
  }

  static getUserByDiscordId(discordId: string) {
    return rentConnectionForFn((conn) => UserDatabase.getUserByDiscordId(discordId, conn));
  }

  static deleteUser(id: string) {
    return rentConnectionForFn((conn) => UserDatabase.deleteUser(id, conn));
  }

  static createUserList(list: UserList) {
    return rentConnectionForFn((conn) => UserListDatabase.createUserList(list, conn));
  }

  static getUserListOwnerId(listId: string) {
    return rentConnectionForFn((conn) => UserListDatabase.getUserListOwnerId(listId, conn));
  }

  static getUserList(listId: string) {
    return rentConnectionForFn((conn) => UserListDatabase.getUserList(listId, conn));
  }

  static getUserListCustom(
    listId: string,
    customType: Exclude<UserListCustomType, UserListCustomType.Default>
  ) {
    return rentConnectionForFn((conn) =>
      UserListDatabase.getUserListCustom(listId, customType, conn)
    );
  }

  static updateUserListName(userId: string, listId: string, name: string) {
    return rentConnectionForFn((conn) =>
      UserListDatabase.updateUserListName(userId, listId, name, conn)
    );
  }

  static updateUserListItems(userId: string, listId: string, items: PHPObject) {
    return rentConnectionForFn((conn) =>
      UserListDatabase.updateUserListItems(userId, listId, items, conn)
    );
  }

  static getUserLists(userId: string) {
    return rentConnectionForFn((conn) => UserListDatabase.getUserLists(userId, conn));
  }

  static deleteUserList(userId: string, listId: string) {
    return rentConnectionForFn((conn) => UserListDatabase.deleteUserList(userId, listId, conn));
  }

  static getUserAuthCode(userId: string) {
    return UserCharacterDatabase.getUserAuthCode(userId);
  }

  static linkUserCharacter(
    userId: string,
    characterId: string,
    characterName: string,
    characterServer: string
  ) {
    return rentConnectionForFn((conn) =>
      UserCharacterDatabase.linkUserCharacter(
        userId,
        characterId,
        characterName,
        characterServer,
        conn
      )
    );
  }

  static unlinkUserCharacter(userId: string, characterId: string) {
    return rentConnectionForFn((conn) =>
      UserCharacterDatabase.unlinkUserCharacter(userId, characterId, conn)
    );
  }

  static updateMainUserCharacter(userId: string, characterId: string, main: boolean) {
    return rentConnectionForFn((conn) =>
      UserCharacterDatabase.updateMainUserCharacter(userId, characterId, main, conn)
    );
  }

  static createUserCharacter(character: UserCharacter) {
    return rentConnectionForFn((conn) =>
      UserCharacterDatabase.createUserCharacter(character, conn)
    );
  }

  static getUserCharacters(userId: string) {
    return rentConnectionForFn((conn) => UserCharacterDatabase.getUserCharacters(userId, conn));
  }

  static getUserCharacter(characterId: string) {
    return rentConnectionForFn((conn) => UserCharacterDatabase.getUserCharacter(characterId, conn));
  }

  static getUserCharacterByLodestoneId(lodestoneId: number) {
    return rentConnectionForFn((conn) =>
      UserCharacterDatabase.getUserCharacterByLodestoneId(lodestoneId, conn)
    );
  }

  static getUserAlerts(userId: string) {
    return rentConnectionForFn((conn) => UserAlertDatabase.getUserAlerts(userId, conn));
  }

  static updateUserAlert(alert: UserAlert) {
    return rentConnectionForFn((conn) => UserAlertDatabase.updateUserAlert(alert, conn));
  }

  static createUserAlert(alert: UserAlert) {
    return rentConnectionForFn((conn) => UserAlertDatabase.createUserAlert(alert, conn));
  }

  static deleteUserAlert(userId: string, alertId: string) {
    return rentConnectionForFn((conn) => UserAlertDatabase.deleteUserAlert(userId, alertId, conn));
  }
}
