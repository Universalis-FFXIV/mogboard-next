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

export interface UserList {
  id: string;
  userId: string | null;
  added: number;
  updated: number;
  name: string;
  custom: boolean;
  customType: number | null;
  items: number[] | DoctrineArray;
}
