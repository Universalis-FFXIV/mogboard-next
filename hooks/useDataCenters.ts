import useSWR from 'swr';
import { getServers } from '../service/servers';

const getSortedServers = () =>
  getServers().then((servers) =>
    (servers.dcs ?? [])
      .map((dc) => ({
        name: dc.name,
        region: dc.region,
        worlds: (dc.worlds ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.region.localeCompare(b.region))
  );

export default function useDataCenters(region?: string) {
  return useSWR(
    `$servers-${region}`,
    () => getSortedServers().then((servers) => servers.filter((server) => !region || server.region === region)),
    {
      // Only revalidate when explicitly requested, not on focus/reconnect
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      // Dedupe requests within 5 minutes
      dedupingInterval: 300000,
    }
  );
}
