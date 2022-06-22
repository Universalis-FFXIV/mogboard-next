import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import DalamudAdapter from '../../../db/DalamudAdapter';

export default NextAuth({
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
});
