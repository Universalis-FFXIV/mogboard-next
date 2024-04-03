import { getServerMarket } from '../service/universalis';
import { MarketV2 } from '../types/universalis/MarketV2';
import useSWRImmutable from 'swr/immutable';

export function useRegionMarket(region: string, itemId: number) {
  return useSWRImmutable(`$market-${region}-${itemId}`, () => getServerMarket(region, itemId));
}

export function useDataCenterMarkets(dcNames: string[], itemId: number) {
  return useSWRImmutable(`$markets-${dcNames.join('-')}-${itemId}`, () =>
    Promise.all(dcNames.map((dcName) => getServerMarket(dcName, itemId))).then(
      (markets) =>
        Object.fromEntries(markets.map((m) => [m.dcName!, m])) as Record<string, MarketV2>
    )
  );
}

export function useDataCenterMarket(dcName: string, itemId: number) {
  return useSWRImmutable(`$market-${dcName}-${itemId}`, () => getServerMarket(dcName, itemId));
}

export function useWorldMarket(world: string | number, itemId: number) {
  return useSWRImmutable(`$market-${world}-${itemId}`, () => getServerMarket(world, itemId));
}
