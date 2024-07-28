import { MarketV2 } from '../types/universalis/MarketV2';

export const FETCH_OPTIONS: RequestInit = {
  headers: {
    'User-Agent': 'mogboard/2.0',
  },
};

export function getBaseUrl(): string {
  return (
    process.env['API_URL'] || process.env['NEXT_PUBLIC_API_URL'] || 'https://universalis.app/api'
  );
}

export async function getServerMarket(server: string | number, itemId: number): Promise<MarketV2> {
  return fetch(`${getBaseUrl()}/v2/${server}/${itemId}`, FETCH_OPTIONS).then((res) => res.json());
}
