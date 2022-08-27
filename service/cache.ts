import { Servers } from './servers';

export interface MogboardCacheItem<T> {
  value: T;
  cachedAt: Date;
}

export interface MogboardCache {
  servers?: MogboardCacheItem<Servers>;
}

export const cache: MogboardCache = {
  servers: undefined,
};
