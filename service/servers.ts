import { differenceInMinutes } from 'date-fns';
import { DataCenter } from '../types/game/DataCenter';
import { World } from '../types/game/World';
import { cache } from './cache';
import { getBaseUrl } from './universalis';
import retry from 'retry-as-promised';

export interface Servers {
  dcs: DataCenter[];
  worlds: World[];
}

export async function getServers(): Promise<Servers> {
  return retry(getServersInternal, {
    max: 3,
    timeout: 5000,
    report: (message) => console.warn(message),
    name: 'getServers',
  });
}

async function getServersInternal(): Promise<Servers> {
  if (cache.servers && differenceInMinutes(cache.servers.cachedAt, new Date()) <= 5) {
    return cache.servers.value;
  }

  try {
    const dcData: { name: string; region: string; worlds: number[] }[] = await fetch(
      `${getBaseUrl()}/v3/game/data-centers`
    ).then((res) => res.json());

    const worlds: World[] = await fetch(`${getBaseUrl()}/v3/game/worlds`).then((res) => res.json());

    const dcs = dcData.map((dc) => ({
      name: dc.name,
      region: dc.region,
      worlds: dc.worlds.map((worldId) => worlds.find((w) => w.id === worldId)!),
    }));

    cache.servers = {
      value: { dcs, worlds },
      cachedAt: new Date(),
    };
  } catch (err) {
    if (cache.servers) {
      return cache.servers.value;
    }

    throw err;
  }

  return cache.servers.value;
}

export function getServerRegionNameMap(regionStrings: {
  europe: string;
  japan: string;
  america: string;
  oceania: string;
  china: string;
}) {
  return new Map<string, string>([
    ['Japan', regionStrings.japan],
    ['North-America', regionStrings.america],
    ['Europe', regionStrings.europe],
    ['Oceania', regionStrings.oceania],
    ['中国', regionStrings.china],
  ]);
}
