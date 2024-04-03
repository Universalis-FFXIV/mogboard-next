import useSWRImmutable from 'swr/immutable';
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
  return useSWRImmutable(`$servers-${region}`, () =>
    getSortedServers().then((servers) => servers.filter((server) => server.region === region))
  );
}
