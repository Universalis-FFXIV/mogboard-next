import { differenceInMinutes } from 'date-fns';
import retry from 'retry-as-promised';
import { cache } from './cache';
import { getBaseUrl } from './universalis';

const isDev = process.env['APP_ENV'] !== 'prod';

export interface TimeZone {
  id: string;
  offset: number;
  name: string;
}

export async function getTimeZones(): Promise<TimeZone[]> {
  return retry(getTimeZonesInternal, {
    max: 5,
    backoffBase: 1000,
    report: (message) => isDev && console.warn(message),
    name: 'getTimeZones',
  });
}

async function getTimeZonesInternal(): Promise<TimeZone[]> {
  if (cache.timezones && differenceInMinutes(cache.timezones.cachedAt, new Date()) <= 5) {
    return cache.timezones.value;
  }

  try {
    const timezones = await fetch(`${getBaseUrl()}/v3/misc/time-zones`).then((res) => res.json());

    cache.timezones = {
      value: timezones,
      cachedAt: new Date(),
    };
  } catch (err) {
    if (cache.timezones) {
      return cache.timezones.value;
    }

    throw err;
  }

  return cache.timezones.value;
}
