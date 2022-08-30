type LodestoneId = number;

export interface LodestoneCharacter {
  bio: string;
  name: string;
  world: string;
  avatar: string;
}

function getBaseUrl(): string {
  if (!process.env['LODESTONE_API']) {
    throw new Error('No Lodestone API set.');
  }

  return process.env['LODESTONE_API'];
}

export async function getCharacter(id: LodestoneId): Promise<LodestoneCharacter> {
  const res = await fetch(`${getBaseUrl()}/character`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: `${id}` }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = await res.json();
  return data;
}

export async function searchCharacter(world: string, name: string): Promise<LodestoneId> {
  const [firstName, lastName] = name.split(' ');
  const res = await fetch(`${getBaseUrl()}/character/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ world, firstName, lastName }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = await res.json();
  return data.id;
}
