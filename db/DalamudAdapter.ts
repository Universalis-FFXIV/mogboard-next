import { Adapter, AdapterUser } from 'next-auth/adapters';
import { User, UserListCustomType } from '../types/universalis/user';
import { acquireConn, releaseConn } from './connect';
import { v4 as uuidv4 } from 'uuid';
import * as db from './user';
import * as listsDb from './user-list';
import { unix } from './util';
import { DoctrineArray } from './DoctrineArray';

export default function DalamudAdapter(): Adapter {
  return {
    async createUser(user) {
      const conn = await acquireConn();
      try {
        const id = uuidv4();
        const username = typeof user.name === 'string' ? user.name : '';
        const email = typeof user.email === 'string' ? user.email : '';
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

        await db.createUser(mogUser, conn);

        // Create the user's custom lists
        const recentlyViewed = listsDb.RecentlyViewedList(uuidv4(), id, new DoctrineArray());
        await listsDb.createUserList(recentlyViewed, conn);

        const faves = listsDb.FavouritesList(uuidv4(), id, new DoctrineArray());
        await listsDb.createUserList(faves, conn);

        return {
          id,
          name: username,
          email: email,
          emailVerified: null,
          image: null,
        } as AdapterUser;
      } finally {
        await releaseConn(conn);
      }
    },
    async getUser(id) {
      const conn = await acquireConn();
      try {
        const user = await db.getUser(id, conn);
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
      } finally {
        await releaseConn(conn);
      }
    },
    async getUserByEmail(email) {
      const conn = await acquireConn();
      try {
        const user = await db.getUserByEmail(email, conn);
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
      } finally {
        await releaseConn(conn);
      }
    },
    async getUserByAccount(account) {
      const conn = await acquireConn();
      try {
        let user: User | null = null;
        if (account.provider === 'discord') {
          user = await db.getUserByDiscordId(account.providerAccountId, conn);
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
      } finally {
        await releaseConn(conn);
      }
    },
    async linkAccount(account) {
      const conn = await acquireConn();
      try {
        if (account.provider === 'discord') {
          await db.updateUserDiscord(
            account.userId,
            account.providerAccountId,
            account.expires_at!,
            account.access_token!,
            account.refresh_token!,
            conn
          );
        }
      } finally {
        await releaseConn(conn);
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
      const conn = await acquireConn();
      try {
        const mogUser = await db.getUser(user.id!, conn);
        if (mogUser == null) {
          throw new Error('User was not found.');
        }

        const id = user.id!;
        const username = user.name ?? mogUser.username;
        const email = user.email ?? mogUser.email;
        const avatar = user.image || mogUser.avatar || '';

        await db.updateUserBasic(id, username, email, avatar ?? '', conn);

        return {
          id,
          name: username,
          email,
          emailVerified: null,
          image: avatar,
        };
      } finally {
        await releaseConn(conn);
      }
    },
    async deleteUser(id) {
      const conn = await acquireConn();
      try {
        await db.deleteUser(id, conn);
      } finally {
        await releaseConn(conn);
      }
    },
    async unlinkAccount(account) {
      const conn = await acquireConn();
      try {
        if (account.provider === 'discord') {
          await db.removeUserDiscord(account.providerAccountId, conn);
        }
      } finally {
        await releaseConn(conn);
      }
    },
  };
}
