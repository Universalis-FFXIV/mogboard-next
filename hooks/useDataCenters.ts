import useSWRImmutable from 'swr/immutable';
import { getServers } from '../service/servers';

export default function useDataCenters() {
  return useSWRImmutable('$servers', () =>
    getServers().then((servers) =>
      (servers.dcs ?? [])
        .map((dc) => ({
          name: dc.name,
          region: dc.region,
          worlds: (dc.worlds ?? []).sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.region.localeCompare(b.region))
    )
  );
}
