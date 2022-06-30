import { DoctrineArray } from '../../db/DoctrineArray';

export interface User {
  id: string;
  added: number;
  lastOnline: number;
  isBanned: boolean;
  notes: string | null;
  sso: string;
  username: string;
  email: string;
  avatar: string | null;
  patron: number;
  patronBenefitUser: string | null;
  permissions: string | null;
  admin: boolean;
  alertsMax: number;
  alertsExpiry: number;
  alertsUpdate: boolean;
  ssoDiscordId: string | null;
  ssoDiscordAvatar: string | null;
  ssoDiscordTokenExpires: number | null;
  ssoDiscordTokenAccess: number | null;
  ssoDiscordTokenRefresh: number | null;
  apiPublicKey: string | null;
  apiAnalyticsKey: string | null;
  apiRateLimit: number;
}

export enum UserListCustomType {
  Default = 0,
  Favourites = 10,
  RecentlyViewed = 20,
}

export interface UserList {
  id: string;
  userId: string | null;
  added: number;
  updated: number;
  name: string;
  custom: boolean;
  customType: UserListCustomType | null;
  items: DoctrineArray;
}

export interface UserCharacter {
  id: string;
  userId: string | null;
  lodestoneId: number;
  name: string | null;
  server: string | null;
  avatar: string | null;
  main: boolean;
  confirmed: boolean;
  updated: number;
}
