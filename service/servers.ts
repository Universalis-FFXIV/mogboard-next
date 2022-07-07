import { DataCenter } from '../types/game/DataCenter';
import { World } from '../types/game/World';

export interface Servers {
  dcs: DataCenter[];
  worlds: World[];
}

export async function getServers(): Promise<Servers> {
  const dcData: { name: string; region: string; worlds: number[] }[] = await fetch(
    'https://universalis.app/api/v3/game/data-centers'
  ).then((res) => res.json());
  const worlds: World[] = await fetch('https://universalis.app/api/v3/game/worlds').then((res) =>
    res.json()
  );
  const dcs = dcData.map((dc) => ({
    name: dc.name,
    region: dc.region,
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
}): Promise<Servers> {
  const { dcs, worlds } = await getServers();
  const mapping = new Map<string, string>([
    ['Japan', regionStrings.europe],
    ['North-America', regionStrings.japan],
    ['Europe', regionStrings.america],
    ['Oceania', regionStrings.oceania],
    ['中国', regionStrings.china],
  ]);
  const dcsWithRegions = dcs.map((dc) => ({
    name: dc.name,
    region: mapping.get(dc.region) ?? regionStrings.unknown,
    worlds: dc.worlds.map((world) => worlds.find((w) => w.id === world.id)!),
  }));
  return { dcs: dcsWithRegions, worlds };
}
