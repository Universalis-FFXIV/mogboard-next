import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import DalamudAdapter from '../../../db/DalamudAdapter';

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
