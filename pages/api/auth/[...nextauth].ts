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
        if (account.provider === 'discord' && account.access_token) {
          const me = await fetch('https://discord.com/api/v9/users/@me', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          }).then((res) => res.json());
          token.picture = `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp?size=96`;
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
