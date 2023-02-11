import useSWRImmutable from 'swr/immutable';
import { getServers } from '../service/servers';
import { World } from '../types/game/World';

export default function useWorlds() {
  return useSWRImmutable('$worlds', () =>
    getServers().then((servers) =>
      (servers.worlds ?? []).reduce<Record<number, World>>(
        (agg, world) => ({
          ...agg,
          [world.id]: world,
        }),
        {}
      )
    )
  );
}
