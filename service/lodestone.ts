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

async function handleError(res: Response) {
  try {
    const data = await res.json();
    if ('message' in data) {
      return data.message;
    }

    return res.statusText;
  } catch {
    return res.statusText;
  }
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
    const message = await handleError(res);
    throw new Error(message);
  }

  const data = await res.json();
  return data;
}

export async function searchCharacter(world: string, name: string): Promise<LodestoneId> {
  const [firstName, lastName] = name.split(' ');
  const body = JSON.stringify({ world, firstName, lastName });

  console.log(`Making request to ${getBaseUrl()}/character/search with payload ${body}`);

  const res = await fetch(`${getBaseUrl()}/character/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const message = await handleError(res);
    throw new Error(message);
  }

  const data = await res.json();
  return data.id;
}
