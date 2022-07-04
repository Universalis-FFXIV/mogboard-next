import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import getConfig from 'next/config';
import DalamudAdapter from '../../../db/DalamudAdapter';

const { serverRuntimeConfig } = getConfig();

export const authOptions: NextAuthOptions = {
  adapter: DalamudAdapter(),
  providers: [
    DiscordProvider({
      clientId: serverRuntimeConfig.discordClientId ?? '',
      clientSecret: serverRuntimeConfig.discordClientSecret ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: serverRuntimeConfig.nextAuthSecret,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        if (!token.picture && account.provider === 'discord' && account.access_token) {
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
              console.log(me);
              token.picture = `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp?size=96`;
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
