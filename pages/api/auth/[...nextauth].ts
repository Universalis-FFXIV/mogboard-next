import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { acquireConn, releaseConn } from '../../../db/connect';
import DalamudAdapter from '../../../db/DalamudAdapter';
import { getUser } from '../../../db/user';
import { Logger } from '../../../service/logger';

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
      if (account) {
        AuthLogger.info(`Creating JWT for user with ID [${token.sub}]`);

        if (
          token.sub &&
          account.provider === 'discord' &&
          !token.picture?.includes('cdn.discordapp.com')
        ) {
          AuthLogger.info(`Retrieving profile picture for user [${token.sub}]`);
          const conn = await acquireConn();
          try {
            const user = await getUser(token.sub, conn);
            token.picture = user?.ssoDiscordAvatar;
          } catch (err) {
            console.error(err);
          } finally {
            await releaseConn(conn);
          }
        }

        if (
          (!token.picture || token.picture.includes('null.webp')) &&
          account.provider === 'discord' &&
          account.access_token
        ) {
          AuthLogger.info(
            `User with ID [${account.userId}] has no profile picture, fetching from Discord`
          );

          try {
            const res = await fetch('https://discord.com/api/v9/users/@me', {
              headers: { Authorization: `Bearer ${account.access_token}` },
            });
            if (!res.ok) {
              const body = res.headers.get('Content-Type')?.includes('application/json')
                ? (await res.json()).message
                : await res.text();
              throw new Error(body);
            } else {
              const me = await res.json();
              const avatar: string | null = me.avatar;
              if (avatar) {
                token.picture = `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp?size=96`;
              }
            }
          } catch (err) {
            console.error(err);
          }
        }

        token.sso = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user != null) {
        AuthLogger.info(`Updating session information for user [${token.sub}]`);

        session.user.id = token.sub;
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
