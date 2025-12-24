import { differenceInMinutes } from 'date-fns';
import { DataCenter } from '../types/game/DataCenter';
import { World } from '../types/game/World';
import { cache } from './cache';
import { getBaseUrl } from './universalis';
import retry from 'retry-as-promised';

const isDev = process.env['APP_ENV'] !== 'prod';

function fetchWithTimeout(url: string, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

export interface Servers {
  dcs: DataCenter[];
  worlds: World[];
}

export type Server =
  | { type: 'region'; region: Region }
  | { type: 'dc'; dc: DataCenter }
  | { type: 'world'; world: World };

export async function getServers(): Promise<Servers> {
  return retry(getServersInternal, {
    max: 5,
    backoffBase: 1000,
    report: (message) => isDev && console.warn(message),
    name: 'getServers',
  });
}

async function getServersInternal(): Promise<Servers> {
  const cacheAge = cache.servers ? differenceInMinutes(new Date(), cache.servers.cachedAt) : null;
  if (isDev) {
    console.log('[getServersInternal] cache age (minutes):', cacheAge);
  }

  if (cache.servers && cacheAge !== null && cacheAge <= 5) {
    if (isDev) {
      console.log('[getServersInternal] returning cached data');
    }
    return cache.servers.value;
  }

  if (isDev) {
    console.log('[getServersInternal] fetching fresh data');
  }

  try {
    const dcData: { name: string; region: string; worlds: number[] }[] = await fetchWithTimeout(
      `${getBaseUrl()}/v3/game/data-centers`
    ).then((res) => res.json());

    const worlds: World[] = await fetchWithTimeout(`${getBaseUrl()}/v3/game/worlds`).then((res) =>
      res.json()
    );

    const dcs = dcData
      .filter((region) => !region.name.includes('Beta'))
      .map((dc) => ({
        name: dc.name,
        region: dc.region as Region,
        worlds: dc.worlds.map((worldId) => worlds.find((w) => w.id === worldId)!),
      }));

    cache.servers = {
      value: { dcs, worlds },
      cachedAt: new Date(),
    };

    if (isDev) {
      console.log('[getServersInternal] cached data:', { dcsCount: dcs.length, worldsCount: worlds.length });
    }
  } catch (err) {
    if (isDev) {
      console.error('[getServersInternal] fetch failed:', err);
    }

    if (cache.servers) {
      if (isDev) {
        console.log('[getServersInternal] returning stale cache due to error');
      }
      return cache.servers.value;
    }

    throw err;
  }

  return cache.servers.value;
}

export type Region = 'Japan' | 'North-America' | 'Europe' | 'Oceania' | '中国' | '한국' | '繁中服';

export const REGIONS = [
  'Japan',
  'North-America',
  'Europe',
  'Oceania',
  '中国',
  '한국',
  '繁中服',
] as const;

export function isGlobalServerRegion(region: Region): boolean {
  return (
    region === 'Japan' || region === 'North-America' || region === 'Europe' || region === 'Oceania'
  );
}

export function getServerRegionNameMap(regionStrings: {
  europe: string;
  japan: string;
  america: string;
  oceania: string;
  china: string;
  korea: string;
  traditionalChinese: string;
}) {
  return new Map<Region, string>([
    ['Japan', regionStrings.japan],
    ['North-America', regionStrings.america],
    ['Europe', regionStrings.europe],
    ['Oceania', regionStrings.oceania],
    ['中国', regionStrings.china],
    ['한국', regionStrings.korea],
    ['繁中服', regionStrings.traditionalChinese],
  ]);
}
