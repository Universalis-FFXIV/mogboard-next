import useSWR from 'swr';
import { getServers } from '../service/servers';

const getSortedServers = () =>
  getServers()
    .then((servers) => {
      console.log('[getSortedServers] received servers:', {
        dcsCount: servers?.dcs?.length,
        worldsCount: servers?.worlds?.length,
      });
      return (servers.dcs ?? [])
        .map((dc) => ({
          name: dc.name,
          region: dc.region,
          worlds: (dc.worlds ?? []).sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.region.localeCompare(b.region));
    })
    .catch((err) => {
      console.error('[getSortedServers] error:', err);
      throw err;
    });

export default function useDataCenters(region?: string) {
  return useSWR(`$servers-${region}`, () => {
    console.log('[useDataCenters] fetching for region:', region);
    return getSortedServers()
      .then((servers) => {
        const filtered = servers.filter((server) => !region || server.region === region);
        console.log('[useDataCenters] filtered servers for region:', region, 'count:', filtered.length);
        return filtered;
      })
      .catch((err) => {
        console.error('[useDataCenters] error for region:', region, err);
        throw err;
      });
  }, {
    // Only revalidate when explicitly requested, not on focus/reconnect
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    // Dedupe requests within 5 minutes
    dedupingInterval: 300000,
  });
}
