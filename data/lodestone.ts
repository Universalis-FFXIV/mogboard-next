type LodestoneId = number;

export interface LodestoneCharacter {
  bio: string;
  name: string;
  world: string;
  avatar: string;
}

function getBaseUrl(): string {
  return `http://${process.env['LODESTONE_HOST']}:${process.env['LODESTONE_PORT']}`;
}

export async function getCharacter(id: LodestoneId): Promise<LodestoneCharacter> {
  const res = await fetch(`${getBaseUrl()}/lodestone/character/${id}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = await res.json();
  return data;
}

export async function searchCharacter(world: string, name: string): Promise<LodestoneId> {
  const [firstName, lastName] = name.split(' ');
  const res = await fetch(
    `${getBaseUrl()}/lodestone/search/character/${world}/${firstName}/${lastName}`
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = await res.json();
  return data.id;
}
