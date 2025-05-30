import { Adapter, AdapterUser } from 'next-auth/adapters';
import { User } from '../types/universalis/user';
import { Database } from './';
import { v4 as uuidv4 } from 'uuid';
import { unix } from './util';
import { PHPObject } from './PHPObject';
import { FavouritesList, RecentlyViewedList } from './user-list';
import { Logger } from '../service/logger';

const AdapterLogger = Logger.child({ location: 'DalamudAdapter' });

export default function DalamudAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = uuidv4();
      const username = typeof user.name === 'string' ? user.name : '';
      const email = typeof user.email === 'string' ? user.email : '';

      AdapterLogger.info(
        `Creating new user with id=[${id}], username=[${username}], email=[${email}]`
      );

      const mogUser: User = {
        id,
        added: unix(),
        lastOnline: 0,
        isBanned: false,
        notes: null,
        sso: '',
        username,
        email,
        avatar: null,
        admin: false,
        patron: 0,
        patronBenefitUser: null,
        permissions: null,
        alertsMax: 5,
        alertsExpiry: 259200,
        alertsUpdate: false,
        ssoDiscordId: null,
        ssoDiscordAvatar: null,
        ssoDiscordTokenExpires: null,
        ssoDiscordTokenAccess: null,
        ssoDiscordTokenRefresh: null,
        apiPublicKey: null,
        apiAnalyticsKey: null,
        apiRateLimit: 0,
      };

      await Database.createUser(mogUser);

      // Create the user's custom lists
      const recentlyViewed = RecentlyViewedList(uuidv4(), id, new PHPObject());
      await Database.createUserList(recentlyViewed);

      const faves = FavouritesList(uuidv4(), id, new PHPObject());
      await Database.createUserList(faves);

      return {
        id,
        name: username,
        email: email,
        emailVerified: null,
        image: null,
      } as AdapterUser;
    },
    async getUser(id) {
      AdapterLogger.info(`Fetching user with ID [${id}]`);

      const user = await Database.getUser(id);
      if (user == null) {
        return null;
      }

      return {
        id: user.id,
        name: user.username,
        email: user.email,
        emailVerified: null,
        image: user.avatar || user.ssoDiscordAvatar,
      };
    },
    async getUserByEmail(email) {
      AdapterLogger.info(`Fetching user with email [${email}]`);

      const user = await Database.getUserByEmail(email);
      if (user == null) {
        return null;
      }

      return {
        id: user.id,
        name: user.username,
        email: user.email,
        emailVerified: null,
        image: user.avatar || user.ssoDiscordAvatar,
      };
    },
    async getUserByAccount(account) {
      let user: User | null = null;
      if (account.provider === 'discord') {
        AdapterLogger.info(`Fetching user for Discord account [${account.providerAccountId}]`);
        user = await Database.getUserByDiscordId(account.providerAccountId);
      } else {
        return null;
      }

      if (user == null) {
        return null;
      }

      return {
        id: user.id,
        name: user.username,
        email: user.email,
        emailVerified: null,
        image: user.avatar || user.ssoDiscordAvatar,
      };
    },
    async linkAccount(account) {
      if (account.provider === 'discord') {
        AdapterLogger.info(
          `Linking Discord account [${account.providerAccountId}] to user [${account.userId}]`
        );
        await Database.updateUserDiscord(
          account.userId,
          account.providerAccountId,
          account.expires_at!,
          account.access_token!,
          account.refresh_token!
        );
      }
    },
    async createSession() {
      throw new Error('Using JWT-based sessions.');
    },
    async getSessionAndUser() {
      throw new Error('Using JWT-based sessions.');
    },
    async updateSession() {
      throw new Error('Using JWT-based sessions.');
    },
    async deleteSession() {
      throw new Error('Using JWT-based sessions.');
    },
    async updateUser(user) {
      AdapterLogger.info(`Updating information for user [${user.id}]`);

      const mogUser = await Database.getUser(user.id!);
      if (mogUser == null) {
        throw new Error('User was not found.');
      }

      const id = user.id!;
      const username = user.name ?? mogUser.username;
      const email = user.email ?? mogUser.email;
      const avatar = user.image || mogUser.avatar || null;
      const discordAvatar = mogUser.ssoDiscordAvatar || null;

      await Database.updateUserBasic(id, username, email, avatar, discordAvatar);

      return {
        id,
        name: username,
        email,
        emailVerified: null,
        image: avatar,
      };
    },
    async deleteUser(id) {
      AdapterLogger.info(`Deleting user [${id}]`);
      await Database.deleteUser(id);
    },
    async unlinkAccount(account) {
      if (account.provider === 'discord') {
        AdapterLogger.info(`Unlinking Discord account [${account.providerAccountId}]`);
        await Database.removeUserDiscord(account.providerAccountId);
      }
    },
  };
}
