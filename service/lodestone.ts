import { IsString, IsUrl, validateOrReject } from 'class-validator';

type LodestoneId = number;

export class LodestoneCharacter {
  @IsString()
  bio!: string;

  @IsString()
  name!: string;

  @IsString()
  world!: string;

  @IsUrl()
  avatar!: string;
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

  // Validate that the data received is correct
  const character = new LodestoneCharacter();
  character.bio = data.bio;
  character.name = data.name;
  character.world = data.world;
  character.avatar = data.avatar;
  await validateOrReject(character);

  return character;
}

export async function searchCharacter(world: string, name: string): Promise<LodestoneId> {
  const [firstName, lastName] = name.split(' ');
  if (firstName == null || lastName == null) {
    throw new Error(`First or last name was null: "${name}"`);
  }

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
  if (data == null || data.id == null) {
    throw new Error('Server responded with null search results.');
  }

  return data.id;
}
