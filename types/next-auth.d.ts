import NextAuth, { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      sso?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  type JWT = {
    sso?: string;
  } & DefaultJWT;
}
