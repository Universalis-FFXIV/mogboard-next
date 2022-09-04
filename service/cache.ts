import { Servers } from './servers';
import { TimeZone } from './timezones';

export interface MogboardCacheItem<T> {
  value: T;
  cachedAt: Date;
}

export interface MogboardCache {
  servers?: MogboardCacheItem<Servers>;
  timezones?: MogboardCacheItem<TimeZone[]>;
}

export const cache: MogboardCache = {};
