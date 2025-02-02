import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { acquireConn, releaseConn } from '../../../db/connect';
import DalamudAdapter from '../../../db/DalamudAdapter';
import { Database } from '../../../db';
import { Logger } from '../../../service/logger';
import { User } from '../../../types/universalis/user';

const AuthLogger = Logger.child({ location: '/api/auth' });

export const authOptions: NextAuthOptions = {
  adapter: DalamudAdapter(),
  providers: [
    DiscordProvider({
      clientId: process.env['DISCORD_CLIENT_ID'] ?? '',
      clientSecret: process.env['DISCORD_CLIENT_SECRET'] ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env['NEXTAUTH_SECRET'],
  callbacks: {
    async jwt({ token, account }) {
      const userId = token.sub;

      if (account && userId) {
        AuthLogger.info(`Creating JWT for user with ID [${userId}]`);

        AuthLogger.info(`Retrieving database information for user [${userId}]`);
        const user = await Database.getUser(userId);
        AuthLogger.info(`Successfully retrieved database information for user [${userId}]`);

        // Fix basic information using the database
        if (account.provider === 'discord' && !token.picture?.includes('cdn.discordapp.com')) {
          token.picture = user?.ssoDiscordAvatar;
        }

        // If we have an access token, also attempt to sync with the OAuth2 provider service
        if (account.provider === 'discord' && account.access_token) {
          AuthLogger.info(`Syncing account information for user [${userId}] with Discord`);
          try {
            const res = await fetch('https://discord.com/api/v9/users/@me', {
              headers: { Authorization: `Bearer ${account.access_token}` },
            });

            if (res.ok) {
              const me = await res.json();
              AuthLogger.info(
                `Successfully fetched Discord profile information for user [${userId}]`
              );

              const discordAvatar = me.avatar
                ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp?size=96`
                : user?.ssoDiscordAvatar;
              if (discordAvatar) {
                // Update the JWT so the user gets the updated profile picture
                token.picture = discordAvatar;
              } else {
                AuthLogger.warn(`Unable to get profile picture for user [${userId}]`);
              }

              const username = me.username ?? user?.username;
              const email = me.email ?? user?.email;

              AuthLogger.info(`Updating account information for user [${userId}]`);
              await Database.updateUserBasic(
                userId,
                username,
                email,
                user?.avatar ?? null,
                discordAvatar ?? null
              );
              AuthLogger.info(`Successfully updated account information for user [${userId}]`);
            } else {
              const body = res.headers.get('Content-Type')?.includes('application/json')
                ? (await res.json()).message
                : await res.text();
              throw new Error(body);
            }
          } catch (err) {
            AuthLogger.error(err);
          }
        }

        token.sso = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token.sub;

      if (session.user != null) {
        AuthLogger.info(`Creating session context for user [${userId}]`);

        session.user.id = userId;
        session.user.sso = token.sso;

        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
