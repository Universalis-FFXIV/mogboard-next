import { DataCenter } from '../types/game/DataCenter';
import { World } from '../types/game/World';

export interface Servers {
  dcs: DataCenter[];
  worlds: World[];
}

export type ServersWithRegionNames = {
  dcs: (DataCenter & { region: string })[];
  worlds: World[];
};

export async function getServers(): Promise<Servers> {
  const dcData: { name: string; worlds: number[] }[] = await fetch(
    'https://universalis.app/api/v3/game/data-centers'
  ).then((res) => res.json());
  const worlds: World[] = await fetch('https://universalis.app/api/v3/game/worlds').then((res) =>
    res.json()
  );
  const dcs = dcData.map((dc) => ({
    name: dc.name,
    worlds: dc.worlds.map((worldId) => worlds.find((w) => w.id === worldId)!),
  }));
  return { dcs, worlds };
}

export async function getServersWithRegions(regionStrings: {
  europe: string;
  japan: string;
  america: string;
  oceania: string;
  china: string;
  unknown: string;
}): Promise<ServersWithRegionNames> {
  const { dcs, worlds } = await getServers();
  const dcRegions = {
    europe: ['Chaos', 'Light'],
    japan: ['Elemental', 'Gaia', 'Mana', 'Meteor'],
    america: ['Crystal', 'Primal', 'Aether'],
    oceania: ['Materia'],
    china: ['陆行鸟', '莫古力', '猫小胖', '豆豆柴'],
  };
  const dcsWithRegions = dcs.map((dc) => ({
    name: dc.name,
    region: dcRegions.europe.includes(dc.name)
      ? regionStrings.europe
      : dcRegions.japan.includes(dc.name)
      ? regionStrings.japan
      : dcRegions.america.includes(dc.name)
      ? regionStrings.america
      : dcRegions.oceania.includes(dc.name)
      ? regionStrings.oceania
      : dcRegions.china.includes(dc.name)
      ? regionStrings.china
      : regionStrings.unknown,
    worlds: dc.worlds.map((world) => worlds.find((w) => w.id === world.id)!),
  }));
  return { dcs: dcsWithRegions, worlds };
}
